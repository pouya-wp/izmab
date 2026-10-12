import type { Language } from './i18n'

export interface ExtraText {
  loading: string; skip: string
  manifesto: string; manifestoAccent: string[]
  workHint: string; teaser: string
  developHint: string; negative: string; positive: string
  apertureLabel: string
  slate: { prod: string; roll: string; scene: string; take: string }
  sheetLabel: string; sheetNote: string
  localTime: string; copy: string; copied: string; studio: string
  routeLabel: string; routeEnd: string
  credits: [string, string][]; creditsTitle: string
  heroLine: [string, string]
  chapters: string[]
}

export const extra: Record<Language, ExtraText> = {
  en: {
    loading: 'Loading reel', skip: 'Skip',
    manifesto: 'One camera. One operator. No filler. Every frame earns its place — cut for the screen it lives on, graded like it is going to a cinema.',
    manifestoAccent: ['camera.', 'frame', 'cinema.'],
    workHint: 'Scroll to cut between projects', teaser: 'Teaser cut',
    developHint: 'Move to develop the negative', negative: 'Negative', positive: 'Positive',
    apertureLabel: 'Aperture',
    slate: { prod: 'Prod.', roll: 'Roll', scene: 'Scene', take: 'Take' },
    sheetLabel: 'Contact sheet', sheetNote: 'Feed coming soon',
    localTime: 'Local time · Yerevan', copy: 'Copy', copied: 'Copied', studio: 'Studio',
    routeLabel: 'Flight path', routeEnd: 'Yerevan',
    creditsTitle: 'Credits',
    credits: [['Directed by', 'IZMAB'], ['Cinematography', 'IZMAB'], ['Edit & colour', 'IZMAB'], ['Sound', 'IZMAB'], ['Languages', 'EN · FA · HY · RU'], ['Filmed in', '11 countries'], ['Next chapter', 'Armenia']],
    heroLine: ['Frames that', 'hold still.'],
    chapters: ['Opening', 'Manifesto', 'Work', 'Reel', 'About', 'Process', 'Packages', 'Journal', 'Contact', 'Departure', 'Credits'],
  },
  fa: {
    loading: 'در حال بارگذاری', skip: 'رد شدن',
    manifesto: 'یک دوربین. یک نگاه. بدون اضافه. هر قاب جایش را به‌دست می‌آورد — برای صفحه‌ای که در آن دیده می‌شود تدوین می‌شود و طوری رنگ می‌گیرد که انگار برای سینما ساخته شده.',
    manifestoAccent: ['دوربین.', 'قاب', 'سینما'],
    workHint: 'برای جابه‌جایی بین پروژه‌ها اسکرول کن', teaser: 'تیزر',
    developHint: 'حرکت بده تا نگاتیو ظاهر شود', negative: 'نگاتیو', positive: 'پوزیتیو',
    apertureLabel: 'دیافراگم',
    slate: { prod: 'تولید', roll: 'رول', scene: 'صحنه', take: 'برداشت' },
    sheetLabel: 'کانتکت‌شیت', sheetNote: 'گالری به‌زودی',
    localTime: 'ساعت محلی · ایروان', copy: 'کپی', copied: 'کپی شد', studio: 'استودیو',
    routeLabel: 'مسیر پرواز', routeEnd: 'ایروان',
    creditsTitle: 'تیتراژ',
    credits: [['کارگردان', 'IZMAB'], ['فیلم‌بردار', 'IZMAB'], ['تدوین و رنگ', 'IZMAB'], ['صدا', 'IZMAB'], ['زبان‌ها', 'EN · FA · HY · RU'], ['فیلم‌برداری در', '۱۱ کشور'], ['فصل بعد', 'ارمنستان']],
    heroLine: ['قاب‌هایی که', 'می‌مانند.'],
    chapters: ['آغاز', 'بیانیه', 'آثار', 'شوریل', 'درباره', 'روند', 'پکیج‌ها', 'یادداشت‌ها', 'تماس', 'سفر', 'تیتراژ'],
  },
  hy: {
    loading: 'Բեռնվում է', skip: 'Բաց թողնել',
    manifesto: 'Մեկ տեսախցիկ։ Մեկ հեղինակ։ Ոչ մի ավելորդ բան։ Յուրաքանչյուր կադր վաստակում է իր տեղը՝ մոնտաժված իր էկրանի համար և գունավորված այնպես, կարծես կինոթատրոնի համար է։',
    manifestoAccent: ['տեսախցիկ։', 'կադր', 'կինոթատրոնի'],
    workHint: 'Ոլորեք՝ նախագծերի միջև անցնելու համար', teaser: 'Թիզեր',
    developHint: 'Շարժեք՝ նեգատիվը երևակելու համար', negative: 'Նեգատիվ', positive: 'Պոզիտիվ',
    apertureLabel: 'Դիաֆրագմա',
    slate: { prod: 'Արտ.', roll: 'Ժապավեն', scene: 'Տեսարան', take: 'Դուբլ' },
    sheetLabel: 'Կոնտակտային թերթ', sheetNote: 'Պատկերասրահը՝ շուտով',
    localTime: 'Տեղական ժամ · Երևան', copy: 'Պատճենել', copied: 'Պատճենված է', studio: 'Ստուդիա',
    routeLabel: 'Թռիչքի ուղի', routeEnd: 'Երևան',
    creditsTitle: 'Տիտրեր',
    credits: [['Ռեժիսոր', 'IZMAB'], ['Օպերատոր', 'IZMAB'], ['Մոնտաժ և գույն', 'IZMAB'], ['Ձայն', 'IZMAB'], ['Լեզուներ', 'EN · FA · HY · RU'], ['Նկարահանված է', '11 երկրում'], ['Հաջորդ գլուխը', 'Հայաստան']],
    heroLine: ['Կադրեր, որոնք', 'մնում են։'],
    chapters: ['Սկիզբ', 'Մանիֆեստ', 'Աշխատանքներ', 'Տեսանյութ', 'Իմ մասին', 'Գործընթաց', 'Փաթեթներ', 'Գրառումներ', 'Կապ', 'Մեկնում', 'Տիտրեր'],
  },
  ru: {
    loading: 'Загрузка плёнки', skip: 'Пропустить',
    manifesto: 'Одна камера. Один автор. Ничего лишнего. Каждый кадр заслуживает своё место — смонтирован для экрана, на котором живёт, и выкрашен так, будто идёт в кинотеатр.',
    manifestoAccent: ['камера.', 'кадр', 'кинотеатр.'],
    workHint: 'Листайте, чтобы переключать проекты', teaser: 'Тизер',
    developHint: 'Ведите курсором, чтобы проявить негатив', negative: 'Негатив', positive: 'Позитив',
    apertureLabel: 'Диафрагма',
    slate: { prod: 'Прод.', roll: 'Ролл', scene: 'Сцена', take: 'Дубль' },
    sheetLabel: 'Контактный лист', sheetNote: 'Лента скоро',
    localTime: 'Местное время · Ереван', copy: 'Копировать', copied: 'Скопировано', studio: 'Студия',
    routeLabel: 'Маршрут', routeEnd: 'Ереван',
    creditsTitle: 'Титры',
    credits: [['Режиссёр', 'IZMAB'], ['Оператор', 'IZMAB'], ['Монтаж и цвет', 'IZMAB'], ['Звук', 'IZMAB'], ['Языки', 'EN · FA · HY · RU'], ['Снято в', '11 странах'], ['Следующая глава', 'Армения']],
    heroLine: ['Кадры, которые', 'остаются.'],
    chapters: ['Начало', 'Манифест', 'Работы', 'Шоурил', 'Обо мне', 'Процесс', 'Пакеты', 'Журнал', 'Контакты', 'Отъезд', 'Титры'],
  },
}
