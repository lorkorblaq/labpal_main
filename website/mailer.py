from flask_mail import Message
from .extensions import mail
from flask import current_app, render_template
import os

def mailer(emailh, subjecth, htmlh):
    with current_app.app_context():
        message = Message(
            subject=subjecth,
            recipients=[emailh],
        )
        message.html = htmlh
        try:
            return mail.send(message)
        except Exception as e:
            return f'Failed to send email: {str(e)}'


def welcomeMail(email, firstname):
    subject = "Hi, I'm Olorunfemi"
    html_content = render_template("templates_for_mail/welcome.html", firstname=firstname)
    message = Message(subject=subject, recipients=[email], html=html_content)
    try:
        mail.send(message)
        return 'Welcome email sent!'
    except Exception as e:
        return f'Failed to send email: {str(e)}'


def send_verification_email(email_address, firstname, link):
    subject = "Verify your LabPal email address"
    html_content = render_template("templates_for_mail/mailing_verification.html", firstname=firstname, link=link)

    mailer(email_address, subject, html_content)
    return "Verification mail sent"

def send_reset_password_mail(email, firstname, link):
    subject = "Reset your LabPal password"
    html_content = render_template("templates_for_mail/reset_password.html", firstname=firstname, link=link)
    mailer(email, subject, html_content)
    return "Password reset mail sent"
    
def request_to_join_lab(email, labname, labowner):
    subject = "Request to join your lab"
    html_content = render_template("templates_for_mail/request_to_join_lab.html", labname=labname, labowner=labowner)
    mailer(email, subject, html_content)
    return "Request to join lab mail sent"

def request_to_join_lab_accepted(email, labname, labowner):
    subject = "Request to join your lab accepted"
    html_content = render_template("templates_for_mail/request_to_join_lab_accepted.html", labname=labname, labowner=labowner)
    mailer(email, subject, html_content)
    return "Request to join lab accepted mail sent"

def request_to_join_lab_rejected(email, labname, labowner):
    subject = "Request to join your lab rejected"
    html_content = render_template("templates_for_mail/request_to_join_lab_rejected.html", labname=labname, labowner=labowner)
    mailer(email, subject, html_content)
    return "Request to join lab rejected mail sent"

def send_lab_invitation(email, labname, labowner):
    subject = "Invitation to join a lab"
    html_content = render_template("templates_for_mail/send_lab_invitation.html", labname=labname, labowner=labowner)
    mailer(email, subject, html_content)
    return "Lab invitation mail sent"

def request_for_demo_mail(data):
    subject = "Request for a demo"
    email="f3mioloko@gmail.com"
    html_content = render_template("templates_for_mail/request_for_demo.html", data=data)
    mailer(email, subject, html_content)
    return "Request for demo mail sent"



    