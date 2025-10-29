import os
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/manual_test.db'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Register
email = 'user1@example.com'
password = 'secret123'
rr = client.post('/api/v1/register', json={'email': email, 'password': password, 'full_name': 'User One'})
print('REGISTER', rr.status_code)
print('REGISTER_BODY_KEYS', sorted(list(rr.json().keys())) if rr.status_code==201 else rr.json())

# Login
rl = client.post('/api/v1/login', json={'email': email, 'password': password})
print('LOGIN', rl.status_code, list(rl.json().keys()) if rl.status_code==200 else rl.json())

token = rl.json().get('access_token')

# Auth me
headers={'Authorization': f'Bearer {token}'}
me = client.get('/api/v1/auth/me', headers=headers)
print('AUTH_ME', me.status_code, me.json())
