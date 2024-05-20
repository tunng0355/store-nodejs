function noti(status, message) {
  Swal.fire({
    icon: status,
    text: message,
  });
}

function CurlHttp(url, method = 'GET', data = null) {
    $.ajax({
      url: url,
      data: data,
      type: method,
      dataType: 'json',
      statusCode: {
        500: function () {
          noti("error",'500 status code! server error');
        },
      },
      success: (data) => {
        if (!data) {
            noti("error",'Không thể nhận dữ liệu về từ api này');
        } else {
          if (data.redirect == undefined && data.redirect == null) {
            noti("success", data.message);
          } else {
            setInterval(() => {
              window.location.href = data.redirect;
            }, 700);

            noti("success", data.message);
          }
        }
      },
      error: function (request) {
        var data = JSON.parse(request.responseText);
        if (!data) {
          noti("error",'Không thể nhận dữ liệu về từ api này');
        } else {
          if (data.redirect == undefined && data.redirect == null) {
            noti("error",data.message);
          } else {
            setInterval(() => {
              window.location.href = data.redirect;
            }, 700);

            noti("error",data.message);
          }
        }
      },
    });
  }

$('form[data-ajax]').submit(function (e) {
  e.preventDefault();
  CurlHttp($(this).attr('action'), $(this).attr('method'), $(this).serialize());
});

function setCookie(cookieName, cookieValue, expirationDays) {
  var date = new Date();
  date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + date.toUTCString();
  document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
}

function getCookie(cookieName) {
  var name = cookieName + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return false;
}
