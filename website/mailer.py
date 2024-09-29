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
    subject = "Hi, I'm LabPal"
    html_content = render_template("welcome.html", firstname=firstname)
    message = Message(subject=subject, recipients=[email], html=html_content)
    try:
        mail.send(message)
        return 'Welcome email sent!'
    except Exception as e:
        return f'Failed to send email: {str(e)}'


def send_verification_email(email_address, firstname, link):
    subject = "Verify your LabPal email address"
    html_content = render_template("mailing_verification.html", firstname=firstname, link=link)

    mailer(email_address, subject, html_content)
    return "Verification mail sent"


# def stockAlert(email, name):
#     alert_items = []
#     for item in items:
#         if 4 < item['in stock'] < 5:
#             item_name = item['item']
#             quantity = item['in stock']
#             test = f'{item_name} has {quantity} vials in stock'
#             alert_items.append(test)
#         # print(alert_items)
#     subject="Stock Alert"
     
#     html = f'<h5>Hello {name},<br></h5><p>Your stock alert level: <br>{ "<br>".join(alert_items) }</p>'
#     # mail.send(message)
#     mailer(email, subject, html)




    