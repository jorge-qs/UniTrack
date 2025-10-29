import os
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='mock'
os.environ['DATABASE_URL']='sqlite:///./backend/manual_test.db'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Hitting profile without auth token should use mock user in mock mode
r = client.post('/api/v1/profile', json={
  'sexo':'M','fecha_nacimiento':'2000-01-01','estado_civil':'Soltero','tipo_colegio':'Público',
  'promedio_general':14.0,'creditos_aprobados':0,'puntaje_ingreso':70.0,'semestres_cursados':0,
  'tiene_beca':False,'cantidad_reservas':0,'familia':'CS','periodo_ingreso':'2024-1'
})
print('PROFILE_POST', r.status_code)

r2 = client.get('/api/v1/profile')
print('PROFILE_GET', r2.status_code)
