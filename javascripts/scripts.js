/* <!-- утилиты и состояние --> */
const $ = (s) => document.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)
const show = (el) => el.classList.remove('hidden')
const hide = (el) => el.classList.add('hidden')
const go = (id) => {
  $$('.scene').forEach((s) => s.classList.remove('active'))
  $(id).classList.add('active')
}

const state = {
  haveKey: false,
  lockGone: false,
  doorTeased: false,
  believed: false,
  wentRight: false
}

/* <!-- SCENE 1: CURTAIN --> */
$('#curtainClose').addEventListener('click', () => {
  hide($('#curtainPanel'))
  show($('#chooseYes'))
  show($('#chooseNo'))
})
$('#curtainNext').addEventListener('click', () => {
  hide($('#curtainPanel'))
  show($('#chooseYes'))
  show($('#chooseNo'))
})

$('#chooseYes').addEventListener('click', () => go('#scene-field'))
$('#chooseNo').addEventListener('click', () => {
  hide($('#curtainPanel'))
  show($('#curtainPanel'))
  $('#curtainText').innerHTML =
    'Нет? Хммм...<br>Как интересно... Ты должно быть не понял.<br><span style="color:#e30">С каких это пор ты тут главный?!</span>'
  setTimeout(() => go('#scene-field'), 1600)
})

/* <!-- SCENE 2: FIELD --> */
$('#actionGo').addEventListener('click', () => {
  hide($('#actionGo'))
  show($('#actionApproach'))
})
$('#actionApproach').addEventListener('click', () => go('#scene-window'))

/* <!-- SCENE 3: WINDOW --> */
function windowScreamer() {
  hide($('#windowPanel'))
  hide($('#windowFrame'))
  show($('#windowDemon'))
  $('#windowDemon').classList.add('shake')
  show($('#actionRun'))
}
$('#windowClose').addEventListener('click', windowScreamer)
$('#windowNext').addEventListener('click', windowScreamer)
$('#windowFrame').addEventListener('click', windowScreamer)
$('#actionRun').addEventListener('click', () => go('#scene-yard'))

/* <!-- SCENE 4: YARD (search) --> */
const yardMsg = (t) => {
  $('#yardText').textContent = t
  show($('#yardPanel'))
}
$('#yardClose').addEventListener('click', () => hide($('#yardPanel')))
$('#yardNext').addEventListener('click', () => hide($('#yardPanel')))

/* окно -> мини-игра фонарик */
$('#yardWindow').addEventListener('click', () =>
  $('#flashlightOverlay').classList.add('show')
)

/* паутина -> мини-игра пауки */
$('#yardWeb').addEventListener('click', () =>
  $('#spidersOverlay').classList.add('show')
)

/* бочка/ведро/рукомойник -> тряска + подсказка */
;['#yardBarrel', '#yardBucket', '#yardWash'].forEach((sel) => {
  $(sel).addEventListener('click', (e) => {
    e.currentTarget.classList.add('shake')
    setTimeout(() => e.currentTarget.classList.remove('shake'), 500)
    yardMsg('Тут ничего нет, нужно посмотреть в другом месте')
  })
})

/* почтовый ящик -> показать ключ */
$('#yardMail').addEventListener('click', () =>
  $('#keyOverlay').classList.add('show')
)
$('#keyOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'keyBig') {
    state.haveKey = true
    $('#keyOverlay').classList.remove('show')
    yardMsg('Ключ найден!')
  } else if (e.target.id === 'keyOverlay') {
    $('#keyOverlay').classList.remove('show')
  }
})

/* дверь/замок */
function tryOpenDoor() {
  if (!state.haveKey) {
    $('#yardLock').classList.add('shake-it')
    setTimeout(() => $('#yardLock').classList.remove('shake-it'), 500)
    yardMsg('Замок на месте. Ключа нет. Придётся искать…')
    return
  }
  if (!state.lockGone) {
    state.lockGone = true
    $('#yardLock').style.display = 'none'
    $('#yardDoor').src = 'images/yard-door-open.png'
    yardMsg('Замок снят. Можно входить.')
    return
  }
  go('#scene-corridor')
}
$('#yardDoor').addEventListener('click', tryOpenDoor)
$('#yardLock').addEventListener('click', tryOpenDoor)

/* <!-- mini-game: flashlight --> */
const flOv = $('#flashlightOverlay')
const flMask = $('#flashlightMask')
flOv.addEventListener('mousemove', (e) => {
  const r = flOv.getBoundingClientRect()
  flMask.style.setProperty('--mx', e.clientX - r.left + 'px')
  flMask.style.setProperty('--my', e.clientY - r.top + 'px')
  flOv.querySelectorAll('.face:not(.cleared)').forEach((f) => {
    const fr = f.getBoundingClientRect()
    if (
      e.clientX > fr.left &&
      e.clientX < fr.right &&
      e.clientY > fr.top &&
      e.clientY < fr.bottom
    ) {
      f.classList.add('cleared')
    }
  })
  if (flOv.querySelectorAll('.face:not(.cleared)').length === 0) {
    flOv.classList.remove('show')
  }
})
flOv.addEventListener('click', (e) => {
  if (e.target === flOv) flOv.classList.remove('show')
})

/* <!-- mini-game: spiders --> */
const spOv = $('#spidersOverlay')
const spWrap = $('#spidersWrap')
function repel(el, e) {
  const r = spWrap.getBoundingClientRect()
  const cx = e.clientX - r.left,
    cy = e.clientY - r.top
  const br = el.getBoundingClientRect()
  const ex = (br.left + br.right) / 2 - r.left
  const ey = (br.top + br.bottom) / 2 - r.top
  const dx = ex - cx,
    dy = ey - cy
  const dist = Math.hypot(dx, dy) || 1
  const nx = ex + (dx / dist) * 14
  const ny = ey + (dy / dist) * 14
  el.style.left = `clamp(2%, ${(nx / r.width) * 100}%, 82%)`
  el.style.top = `clamp(2%, ${(ny / r.height) * 100}%, 82%)`
}
spWrap.addEventListener('mousemove', (e) => {
  spWrap.querySelectorAll('.spider:not(.caught)').forEach((s) => repel(s, e))
})
spWrap.querySelectorAll('.spider').forEach((s) => {
  s.addEventListener('click', () => {
    s.classList.add('caught')
    if (spWrap.querySelectorAll('.spider:not(.caught)').length === 0) {
      spOv.classList.remove('show')
    }
  })
})
spOv.addEventListener('click', (e) => {
  if (e.target === spOv) spOv.classList.remove('show')
})

/* <!-- SCENE 5: CORRIDOR --> */
const showCorrText = (html) => {
  $('#corrText').innerHTML = html
  show($('#corrPanel'))
  if (state.doorTeased) show($('#devilHand'))
}
$('#corrClose').addEventListener('click', () => hide($('#corrPanel')))
$('#corrNext').addEventListener('click', () => hide($('#corrPanel')))

$('#corrDoor').addEventListener('click', () => {
  showCorrText(
    'Свет из комнаты манил, словно приглашая войти.<br>Тёплый свет? Или что-то другое?'
  )
  state.doorTeased = true
  const reveal = () => show($('#devilHand'))
  $('#corrClose').addEventListener('click', reveal, { once: true })
  $('#corrNext').addEventListener('click', reveal, { once: true })
})
$('#corrMirror').addEventListener('click', () =>
  showCorrText(
    'Моё отражение дрожало в мутном стекле. Но за мной кто-то шевельнулся... или это мне показалось?'
  )
)
$('#corrBlood').addEventListener('click', () =>
  showCorrText(
    'Красные пятна блестели на старых ступенях. Кажется, кто-то или что-то недавно здесь прошло…'
  )
)
$('#corrCross').addEventListener('click', () =>
  showCorrText(
    'Старый крест висел над дверью, покрытый пылью. Казалось,<br>он наблюдает… и, может быть, что-то защищает.'
  )
)
$('#corrScratches').addEventListener('click', () =>
  showCorrText(
    'Вглубь стены врезались глубокие царапины. Они ведут вверх, туда, где страшно даже смотреть.'
  )
)

/* письмо -> модал с выбором */
$('#corrLetter').addEventListener('click', () =>
  $('#letterOverlay').classList.add('show')
)
$('#letterEnvelope').addEventListener('click', () => {
  show($('#choiceTitle'))
  show($('#choiceYes'))
  show($('#choiceNo'))
})
$('#letterOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'letterOverlay') e.currentTarget.classList.remove('show')
})
$('#choiceYes').addEventListener('click', () => {
  state.believed = true
  $('#letterOverlay').classList.remove('show')
  go('#scene-forest')
})
$('#choiceNo').addEventListener('click', () => {
  state.believed = false
  $('#letterOverlay').classList.remove('show')
  go('#scene-forest')
})

/* <!-- SCENE 6: FOREST (choice) --> */
$('#forestLeft').addEventListener('click', () => {
  state.wentRight = false
  resolveEnding()
})
$('#forestRight').addEventListener('click', () => {
  state.wentRight = true
  resolveEnding()
})

function resolveEnding() {
  if (state.believed && state.wentRight) {
    go('#scene-good')
  } else {
    go('#scene-bad')
    startBadWolves()
  }
}

/* <!-- BAD ending: хаотичный бег волков --> */
let wolvesTimer = null
function startBadWolves() {
  if (!$('#scene-bad').classList.contains('active')) return
  const w1 = $('#wolf1'),
    w2 = $('#wolf2')
  const move = (w) => {
    w.style.left = 10 + Math.random() * 80 + '%'
  }
  clearInterval(wolvesTimer)
  wolvesTimer = setInterval(() => {
    move(w1)
    move(w2)
  }, 800)
}
// Cursor press feedback (optional)
;(function () {
  const pressOn = () => document.documentElement.classList.add('cursor-pressed')
  const pressOff = () =>
    document.documentElement.classList.remove('cursor-pressed')
  document.addEventListener('mousedown', pressOn)
  document.addEventListener('mouseup', pressOff)
  document.addEventListener('mouseleave', pressOff)
})()
