from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, DateField, BooleanField 
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError

class RegistrationForm(FlaskForm):
    org_id = StringField('org id', validators=[DataRequired(), Length(min=1, max=20)], render_kw={"placeholder":"Organisation Token"})
    firstname = StringField('Firstname', validators=[DataRequired(), Length(min=3, max=20)], render_kw={"placeholder":"First name"})
    lastname = StringField('Lastname', validators=[DataRequired(), Length(min=3, max=20)],  render_kw={"placeholder":"Last name"})
    email = StringField('Email',validators=[DataRequired(), Email()], render_kw={"placeholder":"Email address"})
    password = PasswordField('Password',validators=[DataRequired()],  render_kw={"placeholder":"Password"})
    confirm_password = PasswordField('Confirm Password',validators=[DataRequired(), EqualTo('password')], render_kw={"placeholder":"Verify password"})
    submit = SubmitField('Sign Up')

    # def organisation_id(self, id):
    #     ordid = User.query.filter_by(username=username.data).first()
    #     if user:
    #         raise ValidationError('That username is taken. Please choose a different one.')

class LoginForm(FlaskForm):
    email = StringField('Email',validators=[DataRequired(), Email()],  render_kw={"placeholder":"Email address"})
    password = PasswordField('Password',validators=[DataRequired()],  render_kw={"placeholder":"Password"})
    remember = BooleanField('Remember Me') 
    submit = SubmitField('Login')

class Resetpassword(FlaskForm):
    email = StringField('Email',validators=[DataRequired(), Email()],  render_kw={"email":"Email address"})
    submit = SubmitField('Request Password Reset')

class Newpassword(FlaskForm):
    password = PasswordField('Password',validators=[DataRequired()],  render_kw={"password":"Password"})
    confirm_password = PasswordField('Confirm Password',validators=[DataRequired(), EqualTo('password')], render_kw={"repassword":"Verify password"})
    submit = SubmitField('Reset Password')