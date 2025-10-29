import os
from fastapi.testclient import TestClient

# Use dev test DB
os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/dev_unitrack.db'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Register → Login → Profile → Courses → Predict → WhatIf → History
email = 'student@example.com'
password = 'secret123'

r = client.post('/api/v1/register', json={'email': email, 'password': password, 'full_name': 'Student Test'})
assert r.status_code == 201, r.text
access_token = r.json()['access_token']

l = client.post('/api/v1/login', json={'email': email, 'password': password})
assert l.status_code == 200, l.text
access_token = l.json()['access_token']
headers={'Authorization': f'Bearer {access_token}'}

p = client.post('/api/v1/profile', headers=headers, json={
  'sexo':'M','fecha_nacimiento':'2000-01-01','estado_civil':'Soltero','tipo_colegio':'Público',
  'promedio_general':14.0,'creditos_aprobados':0,'puntaje_ingreso':70.0,'semestres_cursados':0,
  'tiene_beca':False,'cantidad_reservas':0,'familia':'CS','periodo_ingreso':'2024-1'
})
assert p.status_code in (200,201), p.text

c = client.get('/api/v1/courses/available', headers=headers)
assert c.status_code == 200, c.text
courses = c.json()

# Pick one available course (first)
course_code = courses[0]['cod_curso'] if courses else 'CS111'

pred = client.post('/api/v1/predict', headers=headers, json={'cod_curso': course_code, 'features': {}})
assert pred.status_code == 200, pred.text

wi = client.post('/api/v1/whatif', headers=headers, json={'cod_curso': course_code, 'features': {}, 'deltas': {'promedio_general': 1.0}})
assert wi.status_code == 200, wi.text

print('SMOKETEST_OK', course_code, pred.json()['version'])
