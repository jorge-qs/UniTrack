import os
from jose import jwt
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/manual_test.db'

from app.main import create_app

app = create_app()
client = TestClient(app)

# health
r = client.get('/api/v1/health')
print('HEALTH', r.status_code, r.json())

# token
payload = {'sub':'11111111-1111-1111-1111-111111111111','email':'test@example.com'}
token = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')

# courses available
r = client.get('/api/v1/courses/available', headers={'Authorization': f'Bearer {token}'})
print('COURSES', r.status_code, len(r.json()))
