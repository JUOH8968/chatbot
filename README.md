# 🍔 배달 음식 리뷰 감성 분석 챗봇 (My-Chatbot)

국내 3대 배달 앱(배달의민족, 요기요, 쿠팡이츠)의 실제 리뷰 데이터를 기반으로 파인튜닝된 AI 모델과 규칙 기반(Heuristic) 비즈니스 로직을 결합하여, 리뷰의 긍정/부정 판단 및 세부 카테고리(맛/위생/배달) 평가를 자동으로 수행하는 **하이브리드 문서 감성 분석 API 시스템**입니다.

---

## 🚀 프로젝트 개요 (Overview)

단순히 범용적인 텍스트 분류 API를 가져다 쓴 것이 아니라, 배달 도메인 데이터를 직접 수집하여 딥러닝(RoBERTa) 모델을 파인튜닝(Fine-tuning)하고 이를 프론트엔드와 통합 서빙하는 **End-to-End AI 백엔드 파이프라인**을 성공적으로 구축했습니다.

### ✨ 핵심 기능 및 역할 (Key Features)

1. **자연어 문맥 기반의 자동 감성 분류 및 수치화 파이프라인 구축**
   - 배달 어플(배달의민족, 요기요, 쿠팡이츠)의 대규모 크롤링 데이터셋을 기반으로 커스텀 이진 감성 라벨링(1~2점: 부정, 4~5점: 긍정)을 적용했습니다.
   - Hugging Face의 **RoBERTa** 모델을 파인튜닝(학습률 0.00002, 조기 종료 2)하여, 텍스트 문맥에 내재된 미세한 뉘앙스를 인식하고 이를 수학적 감성 스코어(Confidence Score)로 변환해냅니다.
   - 사람의 수동 개입 과정을 완전히 배제하고, 리뷰 텍스트 입력만으로 약 **95%의 높은 정확도**를 지닌 감성 분류(Text Classification) 결과를 실시간으로 도출합니다.

2. **다중 카테고리 기반 하이브리드 자동 판정 에이전트 구현**
   - 딥러닝 AI의 단편적인 긍/부정 결과를 보완하기 위해 3대 핵심 카테고리**(맛, 위생, 배달 속도)**를 키워드 매칭(Heuristics) 기법으로 추출.
   - 각 항목당 1~5점을 별도로 매긴 후, **과반수 조건(2개 이상 긍정이면 최종 긍정)에 따라 최종 감성을 판별하는 다중 의사결정 파이프라인(Business Rule Decision)** 구축.
   - 단 한 항목이라도 "벌레", "머리카락" 같은 치명적 단어가 포함되면 점수를 하락시키고, 판단이 모호한 문맥은 '애매(Neutral)' 처리하는 안전망 장치 설계.

3. **프로덕션 수준 API 배포 (Deployment)**
   - Python `FastAPI` 기반 비동기 REST API 구축 (CORS 처리 완료).
   - 실제 서버 인프라에 **커스텀 도메인(Domain) 연결 및 HTTPS 보안 인증 프로토콜을 적용**하여 프론트엔드 클라이언트가 안전하게 통신할 수 있는 환경 완성.

---

## 🛠 사용 기술 스택 (Tech Stack)

### 🧠 Model & AI Engineering
- **Hugging Face (`transformers`)**
  - Model: RoBERTa
  - Task: Text Classification (감성 분석)
  - Loss Function: Cross-Entropy Loss (클래스 간 오차 최적화)
- **PyTorch**

### ⚙️ Backend & Setup
- **FastAPI** (Python 3.x)
- `Uvicorn` (ASGI Server)
- `Pydantic` (Data Validation)

### 💻 Frontend
- **React** (Create React App 구조)

---

## 📋 시스템 아키텍처 (Architecture)

1. 사용자가 웹(React)에서 리뷰 텍스트 입력 후 POST 요청 (`/analyze`)
2. **Phase 1 (Deep Learning):** 파인튜닝된 RoBERTa 모델이 해당 텍스트를 분석하여 1차 감성 라벨(`LABEL`)과 확신도(`Score`) 추출.
3. **Phase 2 (Business Logic):** FastAPI 내부 에이전트가 텍스트를 재분석하여 (맛, 위생, 배달) 키워드 점수를 매기고, 과반수 룰(Majority Vote)에 따라 최종 감성을 보정/확정.
4. **Result:** JSON 형태로 프론트엔드에 최종 점수, 세부 설명 코멘트 반환.

*(향후 개선 목표: ABSA(속성 기반 감성 분석) 모델 도입 및 ONNX 모델 변환 서빙 효율화 연구 진행)*






## 프로젝트 정리
https://data8968.tistory.com/29

## 사용한 LLM모델
https://huggingface.co/klue/roberta-base

## 내 허깅페이스
https://huggingface.co/ju03/Chatbot_Emotion-classification

