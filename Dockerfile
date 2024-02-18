# Stage 1: Build production image
FROM python:3.11.6-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY ./app/pyproject.toml ./
COPY ./app/README.md ./
COPY ./app/src ./src

ARG NODE_MAJOR=18

RUN pip install pip-tools \
    && pip-compile --upgrade --output-file requirements.txt pyproject.toml \
    && pip install --no-cache-dir -r requirements.txt \
    && python ./src/app/manage.py migrate

RUN apt-get update \
    && apt-get install -y ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install nodejs -y \
    && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
    && apt-get clean

RUN SECRET_KEY=nothing python ./src/app/manage.py tailwind install --no-input;
RUN SECRET_KEY=nothing python ./src/app/manage.py tailwind build --no-input;
RUN SECRET_KEY=nothing python ./src/app/manage.py collectstatic --no-input;

RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# runs the production server
ENTRYPOINT ["python", "./src/app/manage.py"]
CMD ["runserver", "0.0.0.0:8000"]

# gunicorn --worker-tmp-dir /dev/shm web/wsgi.py