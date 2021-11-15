# star-server

star-server is built using Flask for the back end server and React for the front end user interface

## Installation

Requires npm for installing required javascript packages
```bash
cd frontend
npm install
```

Requires pip and venv for installing required python packages
```bash
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

Create SQL Database /root:''@localhost/flask' (Will add more info soon and try to automate this)

## Usage
launch Flask server 
```python
from app import db
db.create_all()
```
run app.py

Launch front end to localhost:3000
```bash
cd frontend
npm start
```

