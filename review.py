import os
# OpenMP 충돌 방지
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# React 통신을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드
MODEL_PATH = "ju03/Chatbot_Emotion-classification"
classifier = pipeline("text-classification", model=MODEL_PATH, tokenizer=MODEL_PATH)

class ReviewRequest(BaseModel):
    content: str

def get_agent_analysis(review_text, label, score):
    # 키워드 정의
    taste_keywords = ['맛', '간', '신선', '양', '식어', '냄새', '맛별로', '맛도', '커피', '음식']
    delivery_keywords = ['배달', '도착', '시간', '늦', '빠름', '포장', '엉망','느','지연']
    hygiene_keywords = ['머리카락', '위생', '벌레', '이물질', '더러', '깨끗']
    
    # 해당 내용 포함 여부 판단 (True/False)
    has_taste = any(kw in review_text for kw in taste_keywords)
    has_delivery = any(kw in review_text for kw in delivery_keywords)
    has_hygiene = any(kw in review_text for kw in hygiene_keywords)
    
    analysis = {
        "taste_score": 5 if label == "LABEL_1" else 2,
        "taste_eval": "맛에 대한 평가를 분석 중입니다.",
        "delivery_score": 5 if label == "LABEL_1" else 3,
        "delivery_eval": "배달 서비스에 대한 분석입니다.",
        "hygiene_score": 5 if label == "LABEL_1" else 1,
        "hygiene_eval": "위생 상태를 체크 중입니다.",
        "final_label": "긍정" if label == "LABEL_1" else "부정",
        "has_taste": has_taste,
        "has_delivery": has_delivery,
        "has_hygiene": has_hygiene
    }

    # 맛 분석 (긍정 단어가 포함된 경우 점수 보정)
    if has_taste:
        if any(kw in review_text for kw in ['맛있', '맛나', '최고']):
            analysis["taste_score"] = 5
            analysis["taste_eval"] = "음식의 맛에 대해 만족하셨습니다."
        elif label == "LABEL_0":
            analysis["taste_score"] = 1
            analysis["taste_eval"] = "맛에 대한 아쉬운 피드백이 확인됩니다."

    # 배달 분석
    if has_delivery:
        if any(bad in review_text for bad in ["늦", "오래", "엉망",'느','지연']):
            analysis["delivery_score"] = 1
            analysis["delivery_eval"] = "배달 지연이나 상태에 대한 불만이 확인됩니다."
        else:
            analysis["delivery_score"] = 5
            analysis["delivery_eval"] = "신속한 배달에 만족하셨습니다."

    # 위생 분석 (이물질 등)
    if has_hygiene:
        if any(bad in review_text for bad in ["머리카락", "벌레", "더러", "이물질",'안']):
            analysis["hygiene_score"] = 1
            analysis["hygiene_eval"] = "위생 및 이물질 관련 불만이 감지되었습니다."
        else:
            analysis["hygiene_score"] = 5
            analysis["hygiene_eval"] = "청결한 위생 상태에 만족하셨습니다."

    return analysis

@app.post("/analyze")
async def analyze_review(request: ReviewRequest):
    result = classifier(request.content)[0]
    analysis_result = get_agent_analysis(request.content, result['label'], result['score'])
    return {"score": round(result['score'] * 100, 1), **analysis_result}