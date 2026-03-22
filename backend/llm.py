from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def summarize_document(text: str, company_name: str) -> dict:
    prompt = f"""
You are a senior Indian credit analyst. Analyze this document for company: {company_name}

DOCUMENT TEXT:
{text[:6000]}

Extract and return the following in a structured way:

1. COMPANY OVERVIEW: What does the company do?
2. KEY FINANCIALS: Revenue, Profit, EBITDA, Debt, Net Worth (whatever is available)
3. RED FLAGS: Any risks, warnings, negative signals you see
4. POSITIVE SIGNALS: Strengths, growth indicators
5. MISSING INFO: What important data is not present in this document?

Be specific. Use Indian financial context (Crores, Lakhs). If a value is not found, say "Not found".
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return {
        "analysis": response.choices[0].message.content,
        "tokens_used": response.usage.total_tokens
    }


def extract_financials(text: str) -> dict:
    prompt = f"""
Extract ONLY financial numbers from this text. Return as key:value pairs.
Look for: Revenue, Sales, Turnover, Profit, PAT, EBITDA, Debt, Loans, Net Worth, Assets

TEXT:
{text[:4000]}

Return in this exact format (use null if not found):
Revenue: <value>
Profit: <value>
EBITDA: <value>
Total Debt: <value>
Net Worth: <value>
Total Assets: <value>
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    
    # Parse into dict
    financials = {}
    for line in raw.strip().split("\n"):
        if ":" in line:
            key, val = line.split(":", 1)
            financials[key.strip()] = val.strip()
    
    return financials


def extract_borrower_profile(text: str) -> dict:
    prompt = f"""
You are a data extractor for a credit risk platform. From the text below, identify and extract key company details.

TEXT:
{text[:5000]}

RETURN ONLY A JSON OBJECT with these keys (if not found use null):
{{
  "company_name": "Full legal name",
  "cin": "Corporate Identification Number",
  "pan": "Permanent Account Number",
  "promoters": ["Name 1", "Name 2"],
  "sector": "e.g. Textiles, IT, Manufacturing",
  "location": "City, State",
  "doc_type": "The type of document this appears to be (e.g. Annual Report, GST Filing, Bank Statement)"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        # Ensure it returns valid JSON
        response_format={ "type": "json_object" }
    )

    try:
        data = json.loads(response.choices[0].message.content)
        # Fallback if company_name is missing
        if not data.get("company_name"):
             data["company_name"] = "Unknown Company"
        return data
    except Exception as e:
        return {
            "company_name": "Unknown Company",
            "cin": None,
            "pan": None,
            "promoters": [],
            "sector": None,
            "location": None,
            "doc_type": "Unknown"
        }