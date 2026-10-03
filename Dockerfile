FROM python:3.10-slim-bookworm
RUN apt-get update && apt-get install -y python3-yaml iperf3 git curl wget sudo procps iputils-ping net-tools gnupg docker.io coreutils gcc build-essential python3-dev && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --upgrade pip 'setuptools>=83.0.0' wheel && pip install --no-cache-dir docker aiohttp==3.14.3 aiosqlite argon2-cffi sentry-sdk tortoise-orm aerich cryptography tomlkit
RUN groupadd -g 1001 tgbot && useradd -u 1001 -g 1001 -m -s /bin/bash tgbot && echo "tgbot ALL=(ALL) NOPASSWD: /opt/tg-bot/scripts/update_os.sh, /usr/bin/systemctl, /bin/journalctl" >> /etc/sudoers
WORKDIR /opt/tg-bot
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /opt/tg-bot/config /opt/tg-bot/logs/bot /opt/tg-bot/logs/watchdog && chown -R tgbot:tgbot /opt/tg-bot && chmod -R 777 /opt/tg-bot/config /opt/tg-bot/logs
USER tgbot
CMD ["python", "bot.py"]
