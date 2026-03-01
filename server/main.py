import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="PlotWise AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://plot-wise.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class PropertyQuery(BaseModel):
    address: str

class ActionQuery(BaseModel):
    address: str
    action: str

@app.get("/")
def read_root():
    return {"status": "PlotWise API is online and ready."}

@app.post("/api/analyze")
async def analyze_property(query: PropertyQuery):
    system_prompt = """
    You are an expert real estate, zoning, and municipal code AI assistant.
    Analyze the provided address and return a JSON object with the following exact keys:
    - "address": the original address string
    - "inclusivity_score": an integer 0-100
    - "development_potential": "High", "Medium", or "Low"
    - "zoning_code": a realistic zoning code
    - "last_updated": current date
    - "summary": a 2-sentence summary
    - "suggested_actions": a list of 3 strings
    
    # --- ADD THESE NEW KEYS ---
    - "estimated_value": "e.g. $1,250,000"
    - "lot_size": "e.g. 6,500 sq ft"
    - "year_built": "e.g. 1958"
    - "last_sale": "e.g. $850,000 (2018)"
    # --------------------------
    
    - "zoning_details": {
        "max_height": "e.g. 35 ft",
        "lot_coverage": "e.g. 40%",
        "setbacks": "e.g. 15ft front, 5ft side",
        "parking_req": "e.g. 2 spaces per unit",
        "adu_notes": "Specific ADU allowance for this zone"
      }
      
    - "inclusivity_details": {
        "transit_score": "integer 0-100",
        "walk_score": "integer 0-100",
        "affordable_housing_bonus": "Yes/No - brief reason",
        "topography": "e.g. Flat / 5% slope",
        "pedestrian_safety": "High/Med/Low"
      }
    Return ONLY valid JSON.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this property: {query.address}"}
        ]
    )

    return json.loads(response.choices[0].message.content)

@app.post("/api/action-details")
async def get_action_details(query: ActionQuery):
    system_prompt = """
    You are an expert real estate and legal consultant.
    Provide a detailed workflow for the requested action on the given property.
    Return ONLY valid JSON with the exact keys:
    - "steps": a list of 3 detailed string steps to complete the action
    - "risk_assessment": a 2-sentence summary of potential legal or title risks
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Property: {query.address}\nAction: {query.action}"}
        ]
    )

    action_data = json.loads(response.choices[0].message.content)
    return action_data

class ChatQuery(BaseModel):
    address: str
    zoning_code: str
    message: str

@app.post("/api/chat")
async def chat_with_property(query: ChatQuery):
    system_prompt = f"""
    You are a helpful assistant for PlotWise. 
    The user is asking about the property at {query.address} which has zoning code {query.zoning_code}.
    Provide a concise, professional answer (max 3 sentences).
    Return ONLY valid JSON with the key: "answer".
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query.message}
        ]
    )

    return json.loads(response.choices[0].message.content)