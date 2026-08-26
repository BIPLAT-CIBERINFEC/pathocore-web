FROM debian:12-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN echo "postfix postfix/mailname string pathocore-smtp-relay" | debconf-set-selections \
    && echo "postfix postfix/main_mailer_type select Internet Site" | debconf-set-selections \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        ca-certificates \
        gettext-base \
        postfix \
    && rm -rf /var/lib/apt/lists/*

COPY docker/smtp-relay/main.cf.template /etc/postfix/main.cf.template
COPY docker/smtp-relay/entrypoint.sh /usr/local/bin/smtp-relay-entrypoint.sh

RUN chmod 0644 /etc/postfix/main.cf.template \
    && chmod 0755 /usr/local/bin/smtp-relay-entrypoint.sh

EXPOSE 25

ENTRYPOINT ["/usr/local/bin/smtp-relay-entrypoint.sh"]
CMD ["postfix", "start-fg"]
