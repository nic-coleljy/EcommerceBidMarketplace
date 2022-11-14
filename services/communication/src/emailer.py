import smtplib
import ssl

from email.message import EmailMessage
from os import environ

username = environ.get("email_username")
password = environ.get("email_password")
smtp_domain = environ.get("email_smtp")
port = environ.get("email_port")
stage = environ.get("stage")


def email_alert(subject, body, to):
    context = ssl.create_default_context()

    # Initialise email message to be sent
    message = EmailMessage()

    # Setting content of email
    message.set_content(body)

    # Setting the email fields
    message["subject"] = subject
    message["to"] = to
    message["from"] = username

    # Email configuration
    server = smtplib.SMTP_SSL(smtp_domain, port=port, context=context)

    # Server tries to login using the given credentials
    try:
        server.login(username, password)
    except Exception as e:
        print(f"Error: {e}")
        server.quit()
        return False

    # Server sends the email out
    if stage == "production-aws":
        server.send_message(message)

    # Shut down the connection
    server.quit()

    return True
