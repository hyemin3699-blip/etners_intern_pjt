import json
import os
import re

from openai import OpenAI

_client = None

# Gemini는 OpenAI SDK와 호환되는 엔드포인트를 무료로 제공한다.
# https://ai.google.dev/gemini-api/docs/openai
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.environ["GEMINI_API_KEY"],
            base_url=GEMINI_BASE_URL,
        )
    return _client


def _extract_json(text: str):
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"AI 응답에서 JSON을 찾지 못했습니다 (길이 {len(text)}): {text[:500]}")


def ask_json(system_prompt: str, user_content: str, max_tokens: int = 4096) -> dict:
    """Gemini(OpenAI 호환 엔드포인트)에 system/user 프롬프트를 보내고 JSON 객체로 파싱해 반환한다."""
    model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
    client = get_client()
    full_system_prompt = (
        system_prompt
        + "\n\n반드시 JSON 객체 하나만 출력하세요. 코드블록(```)이나 설명 문장은 절대 포함하지 마세요."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
        )
    except Exception:
        # response_format(json_object) 미지원 시 프롬프트만으로 재시도
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": user_content},
            ],
            max_tokens=max_tokens,
        )

    text = response.choices[0].message.content or ""
    return _extract_json(text)
