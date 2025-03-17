FROM node:current-alphine3.21

WORKDIR /backend

COPY requirements.txt .

RUN pip intall -r requirements.txt

COPY . .
EXPOSE 8000

CMD ['python3' 'app.py']