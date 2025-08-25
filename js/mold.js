
// AOS
AOS.init();

// 共用載入
$('#header').load('header.html');
$('#footer').load('footer.html');

// loading（取代原本 5 秒的 delay）
window.addEventListener("load", () => {
  $('#loading').removeClass('is-active');
  $('html').removeClass('scroll_lock');
  $('.section_kv').addClass('is-active');
});
setTimeout(() => { $('#loading').removeClass('is-active'); }, 1000); // 最多延遲 1 秒過渡

// header 捲動狀態
$(function() {
  $(window).scroll(function() {
    if ($(document).scrollTop() > 160) {
      $('.header').addClass('is-active', 2000);
      $('.btn_top').addClass('is-active', 2000);
    } else {
      $('.header').removeClass('is-active', 600);
      $('.btn_top').removeClass('is-active', 600);
    }
  });
});

// 主選單開關
$(function() {
  $('header .btn_smenu').click(function() {
    $('header .btn_smenu').toggleClass('is-active');
    $('header .content').toggleClass('is-active');
    $('html').toggleClass('scroll_lock');
  })
});

// 回頂按鈕
$(function() {
  $('.btn_top').click(function() {
    $('html, body').animate({ scrollTop: 0 }, 800);
  })
});

// header 選單 is-active 切換
$(function() {
  $('a.btn_header').click(function() {
    var activeTab = $(this).find("a").attr("href");
    $('a.btn_header').removeClass('is-active');
    $(this).addClass('is-active');
    $('header .btn_smenu').removeClass('is-active');
    $('header .content').removeClass('is-active');
  });
});

// 依網址 hash 高亮相對應的 header 鈕
$(function(){
  $(document).ready(function(){
    if(window.location.hash != "") {
      $('a.btn_header[href="' + window.location.hash + '"]').click()
    }
  });
});

/* =========================
   ✅ 新增：#section_contact 捲到底
   ========================= */
(function () {
  // 若有固定底部工具列、聊天泡泡或版權列會遮住最底部，填它的高度（沒有就 0）
  var FOOTER_OFFSET = 0;

  function scrollToBottom(smooth) {
    var target = Math.max(0, $(document).height() - $(window).height() - FOOTER_OFFSET);
    $('html, body').stop().animate({ scrollTop: target }, smooth ? 600 : 0);
  }

  function isContactHash() {
    return (window.location.hash || '').toLowerCase() === '#section_contact';
  }

  // 直接進站或 hash 變更時，只要是 #section_contact 就捲到底，並在載入後補兩次
  function handleContactHash() {
    if (!isContactHash()) return;
    scrollToBottom(true);                 // 先平滑捲一次
    setTimeout(function(){ scrollToBottom(false); }, 300);  // 避開圖片/字體載入造成位移
    setTimeout(function(){ scrollToBottom(false); }, 700);  // 再補一次更穩
  }

  // 監聽：首次進站、hash 改變（從其他錨點切到 #section_contact）
  $(window).on('load', handleContactHash);
  $(window).on('hashchange', handleContactHash);

  // 行動瀏覽器（地址列收合/螢幕方向變更）時保持在底部
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', function () {
      if (isContactHash()) {
        // 用 1 animation frame 等視窗高度穩定再對齊
        requestAnimationFrame(function(){ scrollToBottom(false); });
      }
    });
  }
})();

/* =========================
   ⬇️ 取代原本攔截所有 # 錨點的點擊事件
   其它錨點維持「平滑捲到該元素」，
   但 #section_contact 交給上面的邏輯「捲到底」
   ========================= */
$(document).on('click', 'a[href^="#"]', function(event) {
  var href = ($(this).attr('href') || '').toLowerCase();

  // 只處理同頁錨點（空字串/單獨 "#" 不處理）
  if (!href || href === '#') return;

  // #section_contact → 不在這裡處理，交給 handleContactHash（並確保 hash 會變更）
  if (href === '#section_contact') {
    event.preventDefault();
    if (window.location.hash.toLowerCase() !== '#section_contact') {
      window.location.hash = 'section_contact'; // 觸發 hashchange → handleContactHash
    } else {
      // 已經是 #section_contact（例如重複點擊），直接捲到底
      $('html, body').stop(); // 取消其他動畫避免卡頓
      var target = Math.max(0, $(document).height() - $(window).height());
      $('html, body').animate({ scrollTop: target }, 600);
    }
    return;
  }

  // 其它一般錨點：沿用你原本的平滑捲動
  var $target = $(href);
  if ($target.length) {
    event.preventDefault();
    $('html, body').animate({ scrollTop: $target.offset().top }, 1000);
  }
});

// slideToggle
$(function() {
  $(".btn_array").click(function (e)  {
    e.preventDefault();
    $(this).parent().find(".array_body").slideToggle();
    $(this).toggleClass('is-active')
    console.log('true');
  });
});