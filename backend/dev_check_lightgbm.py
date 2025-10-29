import os
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/dev_unitrack.db'
os.environ['MODEL_PATH']='../ml_models/models/LightGBM.pkl'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Register/Login
email='student3@example.com'; pw='secret123'
client.post('/api/v1/register', json={'email': email,'password':pw,'full_name':'S Three'})
l = client.post('/api/v1/login', json={'email': email,'password':pw})
headers={'Authorization': f"Bearer {l.json()['access_token']}"}

# Create profile
prof_payload={'sexo':'M','fecha_nacimiento':'2000-01-01','estado_civil':'Soltero','tipo_colegio':'Público','promedio_general':14.0,'creditos_aprobados':0,'puntaje_ingreso':70.0,'semestres_cursados':0,'tiene_beca':False,'cantidad_reservas':0,'familia':'CS','periodo_ingreso':'2024-1'}
client.post('/api/v1/profile', headers=headers, json=prof_payload)

# Predict + WhatIf
pd=client.post('/api/v1/predict', headers=headers, json={'cod_curso':'CS111','features':{}})
wi=client.post('/api/v1/whatif', headers=headers, json={'cod_curso':'CS111','features':{}, 'deltas': {'promedio_general': 1.0}})
print('REAL_MODEL', pd.status_code, wi.status_code, pd.json().get('version'))
