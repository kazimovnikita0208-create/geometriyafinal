// Mock данные для fallback (если backend недоступен)

export const mockDirections = [
  {
    id: 1,
    name: 'Pole Fit',
    slug: 'pole-fit',
    tagline: 'Красивый фитнес на пилоне',
    description: 'На занятии учим элементы и комбинации из них.\n\nНесмотря на то, что большую часть урока проводим «в воздухе», новичкам не стоит бояться Pole Fit. Нагрузка всегда дается по силам. Помимо суставной разминки и работы на пилоне, занятие включает в себя упражнения на общую и специальную физическую подготовку.\n\nОдин из самых эстетичных видов фитнеса, с которым подтягивается все тело!',
    features: ['Трюки и акробатика на пилоне', 'Подходит для новичков', 'Общая физическая подготовка', 'Специальная физическая подготовка'],
    levels: ['Вводный', 'Начинающий', 'Продолжающий', 'Продвинутый'],
    color: '#5833b6'
  },
  {
    id: 2,
    name: 'Pole Exotic',
    slug: 'pole-exotic',
    tagline: 'Танец с пилоном на каблуках',
    description: 'Танец с пилоном на каблуках.\n\nНаправление, где ты сможешь выражать себя через музыку и свое тело. На такой тренировке мы учимся красиво двигаться в специальной обуви — стрипах: с пилоном и без него, в партере.',
    features: ['Танец на каблуках', 'Работа с музыкальностью', 'Движения на пилоне и в партере', 'Развитие пластики'],
    levels: ['Начинающие', 'Продолжающие'],
    color: '#b63384'
  },
  {
    id: 3,
    name: 'Сила & Гибкость',
    slug: 'strength-flexibility',
    tagline: 'Силовая тренировка + растяжка',
    description: 'Силовая тренировка + растяжка\n\nНаправление, которое поможет обрести фигуру мечты и ускорить прогресс в Pole Fit и Pole Exotic. Включает в себя упражнения на общую физическую подготовку и стретчинг.',
    features: ['Общая физическая подготовка', 'Стретчинг', 'Подтянутое тело', 'Способствует прогрессу на пилоне'],
    levels: ['Все уровни'],
    color: '#33b683'
  },
  {
    id: 4,
    name: 'Растяжка',
    slug: 'stretching',
    tagline: 'Здоровое тело, шпагаты и прогибы',
    description: 'Здоровое тело, шпагаты и прогибы\n\nМы сочетаем разные виды стретчинга: активный, пассивный, статический и динамический; составляем программы занятий с учетом современных трендов. В нашем расписании есть классы как фитнес-растяжки, так и растяжки, направленной на достижение определенных целей (к примеру, шпагатов или мостиков).',
    features: ['Сочетание разных видов стретчинга', 'Современные методики', 'Фитнес-растяжка', 'Растяжка на шпагат'],
    levels: ['Все уровни'],
    color: '#3384b6'
  },
  {
    id: 5,
    name: 'Choreo',
    slug: 'choreo',
    tagline: 'Популярные женские стили',
    description: 'Популярные женские стили\n\nНа Choreo мы учим связки в стилях High Heels и Jazz Funk.\n\nHigh Heels — танец на шпильках, где важно не только красиво двигаться, но и удержать равновесие. Направление развивает координацию движений, а также укрепляет мышцы ног.\n\nJazz Funk — симбиоз хип-хопа, джазовой и эстрадной хореографии, вакинга. Яркий танец, который исполняют в кроссовках.',
    features: ['Танцы на каблуках и в кроссовках', 'Укрепление мышц ног', 'Развитие координации', 'Яркие эмоции'],
    levels: ['Все уровни'],
    color: '#b68333'
  },
  {
    id: 6,
    name: 'Strip',
    slug: 'strip',
    tagline: 'Современный стрип',
    description: 'Современный стрип\n\nНа занятиях по этому направлению вы научитесь красиво и пластично двигаться на стрипах: стоя и в партере. Особое внимание в Strip уделяется музыкальности: каждое движение в танце выполняется на определенный звук.',
    features: ['Танцы на каблуках', 'Работа с пластикой', 'Развитие музыкальности', 'Партерная акробатика'],
    levels: ['Все уровни'],
    color: '#e91e63'
  }
];

export const mockSubscriptionTypes = {
  'КЛАССИЧЕСКИЙ': [
    { id: 1, name: '1 занятие', category: 'classic' as const, lessonCount: 1, price: 700, validityDays: 7, description: 'Разовое посещение' },
    { id: 2, name: '4 занятия', category: 'classic' as const, lessonCount: 4, price: 2500, validityDays: 30, description: 'Абонемент на 4 занятия' },
    { id: 3, name: '6 занятий', category: 'classic' as const, lessonCount: 6, price: 3300, validityDays: 30, description: 'Абонемент на 6 занятий' },
    { id: 4, name: '8 занятий', category: 'classic' as const, lessonCount: 8, price: 3800, validityDays: 30, description: 'Абонемент на 8 занятий' },
    { id: 5, name: '12 занятий', category: 'classic' as const, lessonCount: 12, price: 4600, validityDays: 45, description: 'Абонемент на 12 занятий' },
    { id: 6, name: '16 занятий', category: 'classic' as const, lessonCount: 16, price: 5400, validityDays: 60, description: 'Абонемент на 16 занятий' },
    { id: 7, name: 'Безлимит', category: 'classic' as const, lessonCount: 999, price: 5900, validityDays: 30, description: 'Безлимитный абонемент' },
  ],
  'ТОЛЬКО ФИТНЕС': [
    { id: 8, name: '1 занятие', category: 'fitness' as const, lessonCount: 1, price: 600, validityDays: 7, description: 'Разовое посещение' },
    { id: 9, name: '4 занятия', category: 'fitness' as const, lessonCount: 4, price: 2200, validityDays: 30, description: 'Абонемент на 4 занятия' },
    { id: 10, name: '6 занятий', category: 'fitness' as const, lessonCount: 6, price: 2600, validityDays: 30, description: 'Абонемент на 6 занятий' },
    { id: 11, name: '8 занятий', category: 'fitness' as const, lessonCount: 8, price: 3000, validityDays: 30, description: 'Абонемент на 8 занятий' },
    { id: 12, name: '12 занятий', category: 'fitness' as const, lessonCount: 12, price: 3700, validityDays: 45, description: 'Абонемент на 12 занятий' },
  ],
  'КОМБО-АБОНЕМЕНТ': [
    { id: 13, name: '2+2 занятия', category: 'combo' as const, lessonCount: 4, price: 2300, validityDays: 30, description: '2 с пилоном + 2 без пилона' },
    { id: 14, name: '4+4 занятия', category: 'combo' as const, lessonCount: 8, price: 3500, validityDays: 30, description: '4 с пилоном + 4 без пилона' },
    { id: 15, name: '8+4 занятия', category: 'combo' as const, lessonCount: 12, price: 4300, validityDays: 45, description: '8 с пилоном + 4 без пилона' },
  ]
};

