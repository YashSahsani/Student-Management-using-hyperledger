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
		elif(out.text == "Country"):
			return redirect('http://localhost:8000/Country/'+userid,302)
		elif(out.text == "Producer"):
			return redirect('/Producer/'+userid)
		elif(out.text == "Actor"):
			return redirect('/Actor/'+userid)
		elif(out.text == "Writer"):
			return redirect('/Writer/'+userid)
@app.route("/login/<type>")
def TLogin(type):
	if(type == "Country"):
		type ="Buyer"
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
	if(usertype == "Buyer"):
		usertype = "Country"
	if(usertype == "Country"):
		countryname = request.json['countryname']
		dataj = {'userid': userid,'password':password,"usertype":usertype,"countryname":countryname}
	else:
		dataj = {'userid': userid,'password':password,"usertype":usertype}
	print(dataj)
	out = requests.post("http://localhost:3000/api/register-user/",json=dataj)
	sleep(6)
	#out = json.loads(out.text)
	print("==========================")
	print( out.text)
	print("===========================")
	if("Type" in out.text):
			return abort(400)
	return redirect('/login')



@app.route("/<typel>/api/createAsset/",methods=['POST'])
def api_createAsset(typel):
	if(typel != "Producer"):
		abort(403)
	if not request.json:
		abort(400)
	userid = request.json['username']
	AssetId = request.json['assetId']
	Assetname = request.json['assetname']
	advancevalue = request.json['advancevalue']
	owner = request.json['owner']
	actorname = request.json['actorname']
	writername = request.json['writername']
	dataj = {'username': userid,'assetid':AssetId,"assetname":Assetname,"advancevalue":advancevalue,"actorname":actorname,"writername":writername,"owner":owner,'usertype':typel}
	out = requests.post("http://localhost:3000/api/createAsset/",json=dataj)
	#out = json.loads(out.text)
	print("==========================")
	print(out.text)
	print("===========================")
	if(json.loads(out.text)['errorCode'] == 404):
		return redirect('/Producer/'+userid+'/Aerror')
	else:
		return redirect('/Producer/'+userid+'/Asuccess')


@app.route("/<typel>/api/BuyAsset/",methods=['POST'])
def api_BuyAsset(typel):
	if(typel != "Country"):
		abort(403)
	if not request.json:
		abort(400)
	userid = request.json['username']
	AssetId = request.json['assetid']
	episodes = request.json['episodes']
	time = request.json['time']
	dataj = {'username': userid,'assetid':AssetId,'usertype':typel,'time':time,'ep':episodes}
	print(dataj)
	print("+++++++++++++++++++++++")
	out = requests.post("http://localhost:3000/api/BuyAsset/",json=dataj)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print("===========================")
	if(out['errorCode'] == 404):
		return redirect('/Country/'+userid+'/Aerror')
	else:
		return redirect('/Country/'+userid+'/Asuccess')

def api_seeAllAssets(name,typel):
	userid = name
	dataj = {'username': userid,"usertype":typel}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/SeeAllAsset",params=dataj)
	print(out.url)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print(request.referrer)
	print("===========================")
	return out
def api_seeAll(name,typel):
	userid = name
	dataj = {'username': userid,"usertype":typel}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/SeeAll",params=dataj)
	print(out.url)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print(request.referrer)
	print("===========================")
	return out
def api_seeAllNotPaid(name,typel):
	userid = name
	dataj = {'username': userid,"usertype":typel}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/SeeAllNotPaid",params=dataj)
	print(out.url)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	for o in out:
		o['Record'] = 'Advance has been paid.' 
	print("===========================")
	return out

@app.route("/Country/api/AdvPayment/",methods=['POST'])
def api_advpay():
	if not request.json:
		abort(400)
	userid = request.json['username']
	AssetId = request.json['assetid']

	dataj = {'username': userid,"usertype":"Country","assetid":AssetId}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/AdvancePayment",params=dataj)
	print(out.url)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print(request.referrer)
	print("===========================")
	if(out['errorCode'] == 404):
		return redirect('/Country/'+userid+'/Berror')
	else:
		return redirect('/Country/'+userid+'/Bsuccess')
	
	return ou


@app.route("/Producer/api/AkcAdvPayment/",methods=['POST'])
def api_akcadvpay():
	if not request.json:
		abort(400)
	userid = request.json['username']
	AssetId = request.json['assetid']
	countryname = request.json['countryname']
	dataj = {'username': userid,"usertype":"Producer","assetid":AssetId,'countryname':countryname}
	print(dataj)
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/AckAdvancePayment",params=dataj)
	print(out.url)
	out = json.loads(out.text)
	print("==========================")
	print(out)
	print(request.referrer)
	print("===========================")
	if(out['errorCode'] == 404):
		return redirect('/Producer/'+userid+'/Berror')
	else:
		return redirect('/Producer/'+userid+'/Bsuccess')

@app.route("/Country/api/play/",methods=['POST'])
def api_play():
	print("here")
	if not request.json:
		abort(400)
	userid = request.json['username']
	AssetId = request.json['assetid']
	dataj = {'username': userid,"usertype":"Country","assetid":AssetId}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/play",params=dataj)
	print(out.url)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	print(out)

	print(request.referrer)
	print("===========================")
	if(out['errorCode'] == 404):
		return redirect('/Country/'+userid+'/Perror')
	else:
		return redirect('/Country/'+userid+'/Psuccess')

def api_seeAllRoyalty(name,typel):
	userid = name
	dataj = {'username': userid,"usertype":typel}
	print("+++++++++++++++")
	out = requests.get("http://localhost:3000/api/SeeAllRoyalty",params=dataj)
	print(out.url)
	sleep(6)
	out = json.loads(out.text)
	print("==========================")
	output = {}
	for o in out:
		if("akc" in o['Key'] or len(o['Key']) == 7):
			continue
		else:
			output[o['Key']] = o['Record']
	print("===========================")
	print(output)
	return output

@app.route("/<typel>/<name>/SeeMyRoyalty")
def SeeMyRoyalty(name,typel):
	print("here")
	if(typel != "Actor" and typel != "Writer"):
			abort(400)
	else:
		print("here")
		return render_template("queryAllRoyalty.html",out= api_seeAllRoyalty(name,typel))


@app.route("/<typel>/<name>/SeeAllAssets")
def SeeAllAssets(name,typel):
	if(typel != "Country" and typel != "Producer"):
		return "error"
	else:
   		return render_template("queryAllAsset.html", out=  api_seeAllAssets(name,typel))
@app.route("/admin/")
def admin():
	return render_template("admin.html")
@app.route("/admin/list")
def blockchain():
	return render_template("queryAll.html", out=  api_seeAll("Admin","Admin"))
@app.route("/<typel>/<name>/SeeAllNotPaid")
def SeeAllNotPaid(name,typel):
	if(typel != "Producer"):
		return "error"
	else:
   		return render_template("queryAllAsset.html", out=  api_seeAllNotPaid(name,typel))
@app.route("/Producer/<name>/createAsset")
def CreateAsset(name):
        return render_template("createAsset.html",post={'error':''})

@app.route("/Country/<name>/BuyAsset")
def BuyAsset(name):
    return render_template("BuyAsset.html",post={})

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

@app.route("/Producer/<name>/Bsuccess")
def producer_Bsuccess(name):
	return render_template("AkcAdvPay.html",post={'error':'Done'})
@app.route("/Producer/<name>/Berror")
def producer_Berror(name):
	return render_template("AkcAdvPay.html",post={'error':'Something went wrong'}),201

@app.route("/Country/<name>/Berror")
def Country_Berror(name):
	return render_template("AdvPay.html",post={'error':'Advance not payed try again'}),201
@app.route("/Country/<name>/Bsuccess")
def Country_Bsuccess(name):
	return render_template("AdvPay.html",post={'error':'Done'})
@app.route("/Country/<name>/Perror")
def Country_Perror(name):
	return render_template("play.html",post={'error':'media asset not played'}),201

@app.route("/Country/<name>/Psuccess")
def Country_Psuc(name):
	return render_template("play.html",post={'error':'media asset played'})

@app.route("/Country/<name>/AdvPayment")
def AdvPayment(name):
	return render_template("AdvPay.html",post={'error':''})


@app.route("/Producer/<name>/AckAdvPayment")
def AckPayment(name):
	return render_template("AkcAdvPay.html",post={'error':''})

@app.route("/Country/<name>/Play")
def play(name):
	return render_template("play.html",post={'error':''})


@app.route("/Country/<name>")
def Country(name):
    return render_template("Buyer.html")

@app.route("/Producer/<name>")
def Producer(name):
        return render_template("Producer.html")

@app.route("/Actor/<name>")
def Actor(name):
        return render_template("Actor.html")

@app.route("/Writer/<name>")
def Writer(name):
        return render_template("Writer.html")
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
