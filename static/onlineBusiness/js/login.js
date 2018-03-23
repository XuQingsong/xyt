CODE_SUCCESS="10000";
CODE_FAILURE="50099";
REG_PHONE=RegExp('^((13[0-9])|(14[5,7])|(15[^4,\\D])|(18[0-9])|(17[0,6-9]))\\d{8}$');
REG_PWD=RegExp('^[0-9a-zA-z_]{6,16}$');

$(function(){
	$("#onlineBusinessLogin, #onlineBusinessZhuce, #onlineBusinessReset").keyup(function(event ){
		if(13 == event.which){
			$(".submit", $(this)).click();
		}
	});
});
//弹出隐藏层
function showDiv(show_div, bg_div) {
	closeDiv("onlineBusinessLogin", bg_div);
	closeDiv("onlineBusinessZhuce", bg_div);
	closeDiv("onlineBusinessReset", bg_div);
	document.getElementById(show_div).style.display = 'block';
	document.getElementById(bg_div).style.display = 'block';
	var bgdiv = document.getElementById(bg_div);
	bgdiv.style.width = document.body.scrollWidth;
	// bgdiv.style.height = $(document).height();
	$("#" + bg_div).height($(document).height());
};

//关闭弹出层
function closeDiv(show_div, bg_div) {
	document.getElementById(show_div).style.display = 'none';
	document.getElementById(bg_div).style.display = 'none';
	if(!(show_div == 'onlineBusinessLogin' && $("#onlineBusiness_login_remember").is(':checked') && $("#onlineBusinessLogin, #onlineBusinessZhuce, #onlineBusinessReset").filter(":visible").size() > 0)){
		//清空表单值
		$("#"+show_div+" :input[type!='button']").val("");
	}
	$("#"+show_div+" p[id$='_tip']").html("");
};



/**
 * 登录
 * @param ctx
 * @param targetUrl
 */
function onlineBusiness_login(ctx, targetUrl){
	var userName=$("#onlineBusiness_login_userName").val();
	var password=$("#onlineBusiness_login_password").val();
	var remember=$("#onlineBusiness_login_remember").is(':checked');
	var verificationCode=$("#validateCode").val();
	var $tip = $("#onlineBusiness_login_tip");
	if($.trim(userName).length == 0){
		$tip.html("请输入手机号");
		return
	}else if(!REG_PHONE.test(userName)){
		$tip.html("请输入正确的手机号");
		return
	}else if($.trim(password).length == 0){
		$tip.html("请输入密码");
		return
	}else if($.trim(password).length > 16){
		$tip.html("请输入16位以内的密码"); 
		return
	}else if(verificationCode.length == 0){
		$tip.html("请输入验证码"); 
		return
	}else if(verificationCode.length > 4){
		$tip.html("请输入4位验证码"); 
		return
	}
	$tip.html("");
	$.ajax({ 
		url: ctx, 
		type: "post",
		data: {"userName":userName, "password":password, "verificationCode":verificationCode, "remember":remember}, 
		success: function (data, status) {
            var types = data;
            if (types.toString() == CODE_SUCCESS) {
            	$tip.html("登录成功");
            	window.location.href=targetUrl;
            }else if (types.toString() == "50001" || types.toString() == "50011"){
            	$tip.html("用户名或密码错误");
            }else if (types.toString() == "50098"){
            	$tip.html("验证码不正确");
            }
        },
        error: function () { $tip.html("登录失败") }
	});
	
}

/**
 * 注册发送短信
 * @param ctx
 * @returns
 */
var timeout = 60;
var cleanTimeout;
var smsButtonLocal;
function myInterval(){
	var tagName = smsButtonLocal.get(0).tagName;
	if(!tagName){
		return;
	}
	tagName = tagName.toLowerCase();
	timeout--;
	"input" == tagName ? smsButtonLocal.val(timeout+"秒后获取") : smsButtonLocal.text(timeout+"秒后获取");
	if(timeout == 0){
		smsButtonLocal.removeAttr("disabled");
		clearInterval(cleanTimeout);
		"input" == tagName ? smsButtonLocal.val("一键获取") : smsButtonLocal.text("一键获取");
		timeout = 60;
	}
}
/**
 * 发送验证短信
 * @param ctx
 * @param mobile
 * @param smsbutton
 * @param tip
 * @param 1=注册 2=重置
 */
function onlineBusiness_regist_sms(ctx, mobile, smsbutton, tip, type){
	tip.html(""); 
	smsButtonLocal = smsbutton;
	if($.trim(mobile).length == 0){
		tip.html("请输入手机号");
		return
	}else if(!REG_PHONE.test(mobile)){
		tip.html("请输入正确的手机号");
		return
	}
	var go = false;
	$.ajax({
		url: ctx.replace("send","valid/phone"),
		type: "post",
		async: false,
		data: {"mobile":mobile},
		success: function (data, status) {
            var types = data;
            if (types.toString() == 1 && type == 1) {
            	//手机号存在，且当前操作是注册
            	tip.html("手机号已存在");
            }else if(types.toString() == 2 && type == 2){
            	//手机号不存在，且当前操作是重置
            	tip.html("手机号不存在");
            }else if(types.toString() == "50007"){
            	tip.html("发送失败");
            }else{
            	go = true;
            }
        },
        error: function () { 
        	tip.html("验证码发送失败，请稍后再试!") }
	});
	if(!go){
		return ;
	}
	$.ajax({
		url: ctx,
		type: "post",
		data: {"mobile":mobile}, 
		success: function (data, status) {
            var types = data;
            if (types.toString() == CODE_SUCCESS) {
            	smsButtonLocal.attr('disabled',"true");
            	cleanTimeout = setInterval("myInterval()",1000);//1000为1秒钟
            }else if(types.toString() == "50007"){
            	tip.html("发送失败");
            }
        },
        error: function () { 
        	tip.html("验证码发送失败，请稍后再试!") }
	});
}

/**
 * 注册
 * @param ctx
 */
function onlineBusiness_regist(ctx){
	var password=$("#onlineBusiness_regist_password").val();
	var rePassword=$("#onlineBusiness_regist_repassword").val();
	var mobile=$("#onlineBusiness_regist_mobile").val();
	var sms=$("#onlineBusiness_regist_sms").val();
	var $tip = $("#onlineBusiness_regist_tip");
	if($.trim(mobile).length == 0){
		$tip.html("请输入手机号!");
		return;
	}else if(!REG_PHONE.test(mobile)){
		$tip.html("请输入正确的手机号");
		return
	}else if($.trim(password).length == 0){
		$tip.html("请输入密码!");
		return;
	}else if(!REG_PWD.test(password)){
		$tip.html("密码支持数字、字母和下划线的组合，最少6位!");
		return;
	}else if($.trim(password).length > 16){
		$tip.html("请输入16位以内的密码!");
		return;
	}else if($.trim(password).length < 6){
		$tip.html("请输入6位以上的密码!");
		return;
	}else if($.trim(password) != $.trim(rePassword)){
		$tip.html("密码不一致!"); 
		return;
	}else if(sms.length == 0){
		$tip.html("请输入验证码!"); 
		return;
	}else if(sms.length > 4){
		$tip.html("请输入4位验证码!"); 
		return;
	}	
	$.ajax({ 
		url: ctx, 
		type: "post",
		data: {"mobile":mobile, "password":password, "comfirm":rePassword, "validCode":sms}, 
		success: function (data, status) {
            var types = data;
            if(types.toString() == CODE_SUCCESS) {
            	$tip.html("注册成功，即将转到登录界面");
            	//返回登录界面
            	setTimeout(function(){
            		showDiv("onlineBusinessLogin", 'fade');
            		closeDiv("onlineBusinessZhuce", 'fade');
            	},3000);
            }else if(types.toString() == "50016"){
            	$tip.html("用户已存在");
            }else if(types.toString() == "50002"){
            	$tip.html("验证不正确");
            }else if(types.toString() == "50003"){
            	$tip.html("输入的密码不一致");
            }else if(types.toString() == "50010"){
            	$tip.html("验证码过期");
            }else{
            	$tip.html("注册失败");
            }
        },
        error: function () { $tip.html("注册失败") }
		
	});
}

/**
 * 忘记密码
 * @param ctx
 */
function onlineBusiness_reset(ctx){
	var password=$("#onlineBusiness_reset_password").val();
	var rePassword=$("#onlineBusiness_reset_repassword").val();
	var mobile=$("#onlineBusiness_reset_mobile").val();
	var sms=$("#onlineBusiness_reset_sms").val();
	var $tip = $("#onlineBusiness_reset_tip");
	if($.trim(mobile).length == 0){
		$tip.html("请输入手机号!"); 
		return
	}else if(!REG_PHONE.test(mobile)){
		$tip.html("请输入正确的手机号");
		return
	}else if($.trim(password).length == 0){
		$tip.html("请输入密码!");
		return;
	}else if(!REG_PWD.test(password)){
		$tip.html("密码支持数字、字母和下划线的组合，最少6位!");
		return;
	}else if($.trim(password).length > 16){
		$tip.html("请输入16位以内的密码!");
		return;
	}else if($.trim(password).length < 6){
		$tip.html("请输入6位以上的密码!");
		return;
	}else if($.trim(password) != $.trim(rePassword)){
		$tip.html("密码不一致!");
		return;
	}else if(sms.length == 0){
		$tip.html("请输入验证码!"); 
		return
	}else if(sms.length > 4){
		$tip.html("请输入4位验证码!"); 
		return
	}	
	
	$.ajax({ 
		url: ctx,
		type: "post",
		data: {"mobile":mobile, "password":password, "comfirm":rePassword, "validCode":sms}, 
		success: function (data, status) {
            var types = data;
            if(types.toString() == CODE_SUCCESS){
            	$tip.html("密码重置成功，即将转到登录界面");
            	// 返回登录界面
            	setTimeout(function(){
            		showDiv("onlineBusinessLogin", 'fade');
            		closeDiv("onlineBusinessReset", 'fade');
            	},3000);
            }else if(types.toString() == "50001"){
            	$tip.html("用户不存在");
            }else if(types.toString() == "50002"){
            	$tip.html("验证不正确");
            }else if(types.toString() == "50003"){
            	$tip.html("输入的密码不一致");
            }else if(types.toString() == "50010"){
            	$tip.html("验证码过期");
            }else{
            	$tip.html("操作失败");
            }
        },
        error: function () { $tip.html("注册失败") }
	});

}
/**
 * 设置“记住密码”复选框的状态
 * @param ctx
 */
function setRemember(ctx){
	$.ajax({
		url: ctx,
		type: "post",
		data: {}, 
		success: function (data, status) {
			$("#onlineBusiness_login_remember").attr("checked", data.length != 0);
			$("#onlineBusiness_login_userName").val(data.split("&")[0]);
			$("#onlineBusiness_login_password").val(data.split("&")[1]);
        }
	});
}