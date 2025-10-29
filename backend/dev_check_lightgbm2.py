import os
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/dev_unitrack.db'
os.environ['MODEL_PATH']='ml_models/models/LightGBM.pkl'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Login existing user from previous test (or register)
email='student3@example.com'; pw='secret123'
l = client.post('/api/v1/login', json={'email': email,'password':pw})
headers={'Authorization': f"Bearer {l.json()['access_token']}"}

# Predict + WhatIf
pd=client.post('/api/v1/predict', headers=headers, json={'cod_curso':'CS111','features':{}})
wi=client.post('/api/v1/whatif', headers=headers, json={'cod_curso':'CS111','features':{}, 'deltas': {'promedio_general': 1.0}})
print('REAL_MODEL', pd.status_code, wi.status_code, pd.json().get('version'))
