from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('Home.html')

@app.route('/Login')
def login():
    return render_template('Login.html')

@app.route('/Register')
def register():
    return render_template('/Register.html')

if __name__ == '__main__':
    app.run(debug= True)

