import os
from transformers import BertTokenizer, AutoModelForSequenceClassification, pipeline
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# OpenMP 충돌 방지
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = FastAPI()

# React 통신을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 및 토크나이저 로드
MODEL_PATH = "ju03/Chatbot_Emotion-classification"
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

class ReviewRequest(BaseModel):
    content: str

def get_agent_analysis(review_text, label, score):
    # 1. 키워드 및 초기 설정 (기존과 동일)
    taste_keywords = ['맛', '간', '신선', '양', '식어', '냄새', '음식']
    delivery_keywords = ['배달', '도착', '시간', '포장']
    hygiene_keywords = ['청결', '위생', '이물질', '머리카락', '벌레']
    neutral_keywords = ['애매', '보통', '그저', '그냥', '평범', '나쁘지 않', '조금']

    has_taste = any(kw in review_text for kw in taste_keywords)
    has_delivery = any(kw in review_text for kw in delivery_keywords)
    has_hygiene = any(kw in review_text for kw in hygiene_keywords)
    
    analysis = {
        "taste_score": 5 if label == "LABEL_1" else 1,
        "taste_eval": "맛에 대한 평가를 분석 중입니다.",
        "delivery_score": 5 if label == "LABEL_1" else 1,
        "delivery_eval": "배달 서비스에 대한 분석입니다.",
        "hygiene_score": 5 if label == "LABEL_1" else 1,
        "hygiene_eval": "위생 상태를 체크 중입니다.",
        "etc_score": 0, "etc_eval": "",
        "has_taste": has_taste, "has_delivery": has_delivery, "has_hygiene": has_hygiene,
        "has_etc": False
    }

    # 2. 항목별 세부 분석 (기존 로직 유지하되 들여쓰기 주의)
    if has_delivery:
        if any(good in review_text for good in ['빨랐', '빠름', '신속', '엄청 빠']):
            analysis["delivery_score"] = 5
            analysis["delivery_eval"] = "신속한 배달에 매우 만족하셨습니다."
        elif any(nk in review_text for nk in neutral_keywords):
            analysis["delivery_score"] = 3
            analysis["delivery_eval"] = "배달 속도나 서비스가 평범한 수준입니다."
        elif any(slow in review_text for slow in ['안 빠', '늦', '지연', '느림', '오래','느리']):
            analysis["delivery_score"] = 1
            analysis["delivery_eval"] = "배달 지연에 대한 불만이 확인됩니다."

    if has_taste:
        if any(good in review_text for good in ['맛있', '맛나', '최고','맛없지 않']):
             analysis["taste_score"] = 5
             analysis["taste_eval"] = "음식의 맛에 대해 만족하셨습니다."
        elif any(nk in review_text for nk in neutral_keywords):
            analysis["taste_score"] = 3
            analysis["taste_eval"] = "맛이 평이하거나 다소 애매하다는 평가입니다."
        elif any(bad in review_text for bad in ['맛없', '맛도 없', '별로']):
            analysis["taste_score"] = 1
            analysis["taste_eval"] = "맛에 대한 아쉬운 피드백이 확인됩니다."

    if has_hygiene:
        bad_hygiene = ['머리카락', '벌레', '더러', '이물질', '지저분', '안 깨끗']
        if any(bad in review_text for bad in bad_hygiene):
            analysis["hygiene_score"] = 1
            analysis["hygiene_eval"] = "머리카락이나 이물질 등 위생 관련 불만이 확인됩니다."
        elif any(good in review_text for good in ['깨끗', '청결', '깔끔', '좋']):
            analysis["hygiene_score"] = 5
            analysis["hygiene_eval"] = "청결한 위생 상태에 만족하셨습니다."
        elif any(nk in review_text for nk in neutral_keywords):
            analysis["hygiene_score"] = 3
            analysis["hygiene_eval"] = "위생 상태가 보통 수준인 것으로 보입니다."

    # 3. 최종 판정 로직 (중요: 순서와 들여쓰기 수정)
    scores = []
    if has_taste: scores.append(analysis["taste_score"])
    if has_delivery: scores.append(analysis["delivery_score"])
    if has_hygiene: scores.append(analysis["hygiene_score"])

    # 판정 우선순위 1: 주요 카테고리 언급이 없을 때 (총평/기타 처리)
    if not scores:
        if any(nk in review_text for nk in neutral_keywords):
            analysis["has_etc"] = True
            analysis["etc_score"] = 3
            analysis["etc_eval"] = "전체적인 총평이 평이하거나 애매합니다."
            analysis["final_label"] = "애매"
        else:
            analysis["final_label"] = "긍정" if label == "LABEL_1" else "부정"
        return analysis # 결과 확정 후 즉시 반환

    # 판정 우선순위 2: 항목 중 하나라도 3점(애매)이 있는가?
    if 3 in scores:
        analysis["final_label"] = "애매"
    else:
        # 판정 우선순위 3: 하나라도 부정(1~2점)이 있으면 최종 부정
        neg_count = sum(1 for s in scores if s <= 2)
        if neg_count >= 1:
            analysis["final_label"] = "부정"
        else:
            # 모두 긍정인 경우 모델의 label 참조
            analysis["final_label"] = "긍정" if label == "LABEL_1" else "부정"

    return analysis # 최종 객체 반환

@app.post("/analyze")
async def analyze_review(request: ReviewRequest):
    result = classifier(request.content)[0]
    analysis_result = get_agent_analysis(request.content, result['label'], result['score'])
    return {"score": round(result['score'] * 100, 1), **analysis_result}
