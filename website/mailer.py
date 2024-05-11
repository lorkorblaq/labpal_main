from flask_mail import Message, Mail
# from website import mail
# from website import mailer
# from . import db_clinical
# mail = create_app().mail

def mailer(mail, emailh, subjecth, htmlh):
    message = Message(
        subject=subjecth,
        recipients=[emailh],
    )
    message.html = htmlh
    return mail.send(message)

def welcomeMail(email, name):
    subject="Clinicalx Welcome Email"    
    html = f'<h1>Welcome {name}, to Clinicalx.</h1>'
    mailer(email,subject, html)
    # return "Email sent"


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




    