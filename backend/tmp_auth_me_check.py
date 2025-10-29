import os
from fastapi.testclient import TestClient

os.environ['APP_ENV']='dev'
os.environ['AUTH_MODE']='jwt'
os.environ['JWT_SECRET']='dev-secret-key-change-in-production'
os.environ['DATABASE_URL']='sqlite:///./backend/manual_test.db'

from app.main import create_app

app = create_app()
client = TestClient(app)

# Login to get token
email = 'user1@example.com'
password = 'secret123'
rl = client.post('/api/v1/login', json={'email': email, 'password': password})
token = rl.json()['access_token']
headers={'Authorization': f'Bearer {token}'}

me = client.get('/api/v1/me', headers=headers)
print('AUTH_ME_ALT', me.status_code, me.json())
