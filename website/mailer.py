from flask import session
from flask_mail import Message
from . import mail


def mailer(emailh, subjecth, htmlh):
        message = Message(
        subject= subjecth,
        recipients=[emailh],
        )
        message.html = htmlh
        return mail.send(message)

def welcomeMail(email, name):
    subject="Clinicalx Welcome Email"    
    html = f'<h1>Welcome {name}, to Clinicalx.</h1>'
    mailer(email,subject, html)
    # return "Email sent"





    