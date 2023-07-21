from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)

@app.get('/')
def verify():
    req_query = request.args
    print(req_query)
    return 200

@app.post('/')
def reply():
    pass

app.run(port=3000, debug=True)
