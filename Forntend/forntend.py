from flask import request,Flask,render_template,jsonify,abort,redirect,url_for,make_response
import requests
from time import sleep
import json
app = Flask(__name__)

@app.route("/")
def ADDProfile():
  return render_template("index.html",post={'error':''})




@app.route("/<typel>/afterlogin", methods=['POST'])
def aferLogin(typel):
	if not request.json:
        	abort(400)
	userid = request.json['userid']
	password = request.json['password']
	usertype = typel
	dataj = {'userid': userid,'password':password,"usertype":usertype}
	out = requests.post("http://localhost:3000/afterlogin",json=dataj)
	#out = json.loads(out.text) 
	print(out.text)
	try:
		
		if(json.loads(out.text)['errorcode'] == 402):
			return abort(400)
	except:
		if(out.text =="admin"):
			pass
		elif(out.text == "Faculty"):
			return redirect('http://localhost:8000/Faculty/'+userid,302)
		elif(out.text == "Student"):
			return redirect('/Student/'+userid)
@app.route("/login/<type>")
def TLogin(type):
	return render_template("login.html",post={'usertype':type})
@app.route("/login")
def Login():
	return render_template("type_login.html")




@app.route("/api/register-user/",methods=['POST'])
def api_register_user():
	if not request.json:
		abort(400)
	userid = request.json['userid']
	password = request.json['password']
	usertype = request.json['usertype']
	dataj = {'userid': userid,'password':password,"usertype":usertype}
	print(dataj)
	out = requests.post("http://localhost:3000/api/register-user/",json=dataj)
	sleep(3)
	#out = json.loads(out.text)
	print("==========================")
	print( out.text)
	print("===========================")
	if("Type" in out.text):
			return abort(400)
	return redirect('/login')



@app.route("/<typel>/api/AdmitAStudent/",methods=['POST'])
def api_AdmitAStudent(typel):
	if(typel != "admin"):
		abort(403)
	if not request.json:
		abort(400)
	userid = request.json['username']
	rollno = request.json['rollno']
	name = request.json['name']
	dataj = {'username': userid,'rollno':rollno,"name":name,'usertype':typel}
	out = requests.post("http://localhost:3000/api/AdmitAStudent/",json=dataj)
	#out = json.loads(out.text)
	print("==========================")
	print(out.text)
	print("===========================")
	if(json.loads(out.text)['errorCode'] == 404):
		return redirect('/admin/'+userid+'/Aerror')
	else:
		return redirect('/admin/'+userid+'/Asuccess')


@app.route("/<typel>/api/AddGrade/",methods=['POST'])
def api_AddGrade(typel):
	if(typel != "Faculty"):
		abort(403)
	if not request.json:
		abort(400)
	userid = request.json['username']
	semno = request.json['semno']
	rollno = request.json['rollno']
	Dict = request.json['dict']
	dataj = {'username': userid,'semno':semno,'usertype':typel,'dict':Dict,'rollno':rollno}
	print(dataj)
	print("+++++++++++++++++++++++")
	out = requests.post("http://localhost:3000/api/AddGrade/",json=dataj)
	sleep(3)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print("===========================")
	if(out['errorCode'] == 404):
		return redirect('/Faculty/'+userid+'/Aerror')
	else:
		return redirect('/Faculty/'+userid+'/Asuccess')

def api_GetStudentInfo(name,typel,rollno):
	userid = name
	dataj = {'username': userid,"usertype":typel,'rollno':rollno}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/SeeAllAsset",params=dataj)
	print(out.url)
	sleep(3)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print(request.referrer)
	print("===========================")
	return out


@app.route("/<typel>/<name>/<rollno>/GetStudentInfo")
def GetStudentInfo(name,typel,rollno):
	if(typel != "Faculty" and typel != "Student"):
		return "error"
	else:
   		return render_template("GetStudentInfo.html", out=  api_GetStudentInfo(name,typel,rollno))
@app.route("/admin/")
def admin():
	return render_template("admin.html")


@app.route("/Faculty/<name>/")
def AdmitAStudent(name):
        return render_template("AdmitAStudent.html",post={'error':''})

@app.route("/Country/<name>/Asuccess")
def success(name):
	return render_template("BuyAsset.html",post={"error":"Congratulation..."})

@app.route("/Producer/<name>/Asuccess")
def producer_success(name):
	return render_template("createAsset.html",post={'error':'Asset Created'})
@app.route("/Producer/<name>/Aerror")
def producer_error(name):
	return render_template("createAsset.html",post={'error':'Asset Not Created'}),201

@app.route("/Country/<name>/Aerror")
def Country_error(name):
	return render_template("BuyAsset.html",post={'error':'This asset doesn\'t exist or Something went wrong please try again.'}),201



@app.route("/Country/<name>/Psuccess")
def Country_Psuc(name):
	return render_template("play.html",post={'error':'media asset played'})


@app.route("/Country/<name>")
def Country(name):
    return render_template("Buyer.html")

@app.route("/Producer/<name>")
def Producer(name):
        return render_template("Producer.html")


@app.route("/register-user/error")
def login_err():
	return render_template("index.html",post={"error":"Something went wrong please retry."})
@app.route("/register-user/success")
def login_suc():
	return render_template("index.html",post={"error":"Please wait 24 hours till admin of the group enrolls you..."})
@app.route("/register-user/login")
def login_log():
	return redirect(url_for('Login'))



if __name__ == "__main__":
	app.jinja_env.auto_reload = True
	app.config['TEMPLATES_AUTO_RELOAD'] = True
	app.run(host='127.0.0.1', port=8000, debug=True)
