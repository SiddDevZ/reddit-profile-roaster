import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      title: "Reddit's Not a Safe Space Anymore.",
      subtitle: "Enter your username and witness the art of digital destruction. Our sophisticated A.I roasts you by your comments and posts.",
      usernameForm: {
        placeholder: "Enter Reddit username",
        button: "Get Roasted",
        loading: "Preparing your roast...",
        error: "Please enter a valid username"
      },
      warning: {
        title: "SYSTEM WARNING",
        message: "[CAUTION] Not safe for heart patients or fragile egos. Proceed at your own risk! 😈"
      },
      footer: "Crafted with precision. Delivered without mercy.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  es: {
    translation: {
      title: "Reddit Ya No Es un Lugar Seguro.",
      subtitle: "Ingresa tu nombre de usuario y presencia el arte de la destrucción digital. Nuestra sofisticada I.A. te humilla por tus comentarios y publicaciones.",
      usernameForm: {
        placeholder: "Ingresa nombre de usuario de Reddit",
        button: "Ser Humillado",
        loading: "Preparando tu humillación...",
        error: "Por favor ingresa un nombre de usuario válido"
      },
      warning: {
        title: "ADVERTENCIA DEL SISTEMA",
        message: "[PRECAUCIÓN] No es seguro para cardíacos o egos frágiles. ¡Procede bajo tu propio riesgo! 😈"
      },
      footer: "Elaborado con precisión. Entregado sin piedad.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  fr: {
    translation: {
      title: "Reddit N'est Plus un Espace Sûr.",
      subtitle: "Entrez votre nom d'utilisateur et assistez à l'art de la destruction numérique. Notre I.A. sophistiquée vous roast par vos commentaires et publications.",
      usernameForm: {
        placeholder: "Entrez le nom d'utilisateur Reddit",
        button: "Se Faire Roaster",
        loading: "Préparation de votre roast...",
        error: "Veuillez entrer un nom d'utilisateur valide"
      },
      warning: {
        title: "AVERTISSEMENT SYSTÈME",
        message: "[ATTENTION] Pas sûr pour les cardiaques ou les egos fragiles. Procédez à vos propres risques! 😈"
      },
      footer: "Fabriqué avec précision. Livré sans pitié.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  de: {
    translation: {
      title: "Reddit ist Kein Sicherer Raum Mehr.",
      subtitle: "Geben Sie Ihren Benutzernamen ein und erleben Sie die Kunst der digitalen Zerstörung. Unsere ausgeklügelte K.I. roastet Sie durch Ihre Kommentare und Beiträge.",
      usernameForm: {
        placeholder: "Reddit-Benutzername eingeben",
        button: "Roasten Lassen",
        loading: "Bereite dein Roast vor...",
        error: "Bitte geben Sie einen gültigen Benutzernamen ein"
      },
      warning: {
        title: "SYSTEMWARNUNG",
        message: "[VORSICHT] Nicht sicher für Herzpatienten oder zerbrechliche Egos. Auf eigene Gefahr fortfahren! 😈"
      },
      footer: "Mit Präzision gefertigt. Erbarmungslos geliefert.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  it: {
    translation: {
      title: "Reddit Non È Più Uno Spazio Sicuro.",
      subtitle: "Inserisci il tuo nome utente e assisti all'arte della distruzione digitale. La nostra sofisticata I.A. ti roasta tramite i tuoi commenti e post.",
      usernameForm: {
        placeholder: "Inserisci nome utente Reddit",
        button: "Farsi Roastare",
        loading: "Preparando il tuo roast...",
        error: "Per favore inserisci un nome utente valido"
      },
      warning: {
        title: "AVVISO DI SISTEMA",
        message: "[ATTENZIONE] Non sicuro per cardiopatici o ego fragili. Procedi a tuo rischio e pericolo! 😈"
      },
      footer: "Realizzato con precisione. Consegnato senza pietà.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  pt: {
    translation: {
      title: "Reddit Não É Mais um Espaço Seguro.",
      subtitle: "Digite seu nome de usuário e testemunhe a arte da destruição digital. Nossa I.A. sofisticada te roasta através de seus comentários e posts.",
      usernameForm: {
        placeholder: "Digite o nome de usuário do Reddit",
        button: "Ser Roastado",
        loading: "Preparando seu roast...",
        error: "Por favor digite um nome de usuário válido"
      },
      warning: {
        title: "AVISO DO SISTEMA",
        message: "[CUIDADO] Não é seguro para cardíacos ou egos frágeis. Prossiga por sua própria conta e risco! 😈"
      },
      footer: "Criado com precisão. Entregue sem piedade.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  ja: {
    translation: {
      title: "Redditはもはや安全な場所ではない。",
      subtitle: "ユーザー名を入力して、デジタル破壊の芸術を目撃してください。私たちの洗練されたAIが、あなたのコメントや投稿であなたをローストします。",
      usernameForm: {
        placeholder: "Redditユーザー名を入力",
        button: "ローストされる",
        loading: "ローストを準備中...",
        error: "有効なユーザー名を入力してください"
      },
      warning: {
        title: "システム警告",
        message: "[注意] 心臓病患者やもろいエゴには安全ではありません。自己責任で進行してください！😈"
      },
      footer: "精密に作成。容赦なく配信。",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  ko: {
    translation: {
      title: "Reddit은 더 이상 안전한 공간이 아니다.",
      subtitle: "사용자명을 입력하고 디지털 파괴의 예술을 목격하세요. 우리의 정교한 AI가 당신의 댓글과 게시물로 당신을 로스트합니다.",
      usernameForm: {
        placeholder: "Reddit 사용자명 입력",
        button: "로스트당하기",
        loading: "로스트 준비 중...",
        error: "유효한 사용자명을 입력해주세요"
      },
      warning: {
        title: "시스템 경고",
        message: "[주의] 심장병 환자나 연약한 자존심에게는 안전하지 않습니다. 자신의 위험을 감수하고 진행하세요! 😈"
      },
      footer: "정밀하게 제작. 무자비하게 전달.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  zh: {
    translation: {
      title: "Reddit不再是安全的空间了。",
      subtitle: "输入您的用户名，见证数字毁灭的艺术。我们精密的AI通过您的评论和帖子来烤您。",
      usernameForm: {
        placeholder: "输入Reddit用户名",
        button: "被烤",
        loading: "正在准备您的烤制...",
        error: "请输入有效的用户名"
      },
      warning: {
        title: "系统警告",
        message: "[注意] 对心脏病患者或脆弱的自尊心不安全。风险自负！😈"
      },
      footer: "精密制作。无情交付。",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  hi: {
    translation: {
      title: "Reddit अब कोई सुरक्षित स्थान नहीं है।",
      subtitle: "अपना उपयोगकर्ता नाम दर्ज करें और डिजिटल विनाश की कला देखें। हमारा परिष्कृत AI आपकी टिप्पणियों और पोस्ट के माध्यम से आपको रोस्ट करता है।",
      usernameForm: {
        placeholder: "Reddit उपयोगकर्ता नाम दर्ज करें",
        button: "रोस्ट हो जाओ",
        loading: "आपका रोस्ट तैयार कर रहे हैं...",
        error: "कृपया एक वैध उपयोगकर्ता नाम दर्ज करें"
      },
      warning: {
        title: "सिस्टम चेतावनी",
        message: "[सावधान] दिल के मरीजों या नाजुक अहंकार के लिए सुरक्षित नहीं। अपने जोखिम पर आगे बढ़ें! 😈"
      },
      footer: "सटीकता के साथ निर्मित। निर्दयता से वितरित।",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  ar: {
    translation: {
      title: "Reddit لم يعد مكانًا آمنًا.",
      subtitle: "أدخل اسم المستخدم الخاص بك واشهد فن التدمير الرقمي. ذكاؤنا الاصطناعي المتطور يشوي لك من خلال تعليقاتك ومنشوراتك.",
      usernameForm: {
        placeholder: "أدخل اسم مستخدم Reddit",
        button: "اشو نفسك",
        loading: "نحضر شويتك...",
        error: "يرجى إدخال اسم مستخدم صالح"
      },
      warning: {
        title: "تحذير النظام",
        message: "[تحذير] غير آمن لمرضى القلب أو الأنا الهشة. تابع على مسؤوليتك الخاصة! 😈"
      },
      footer: "مصنوع بدقة. مُسلَّم بلا رحمة.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  },
  ru: {
    translation: {
      title: "Reddit больше не безопасное пространство.",
      subtitle: "Введите свое имя пользователя и станьте свидетелем искусства цифрового уничтожения. Наш изощренный ИИ жарит вас через ваши комментарии и посты.",
      usernameForm: {
        placeholder: "Введите имя пользователя Reddit",
        button: "Быть поджаренным",
        loading: "Готовим вашу жарку...",
        error: "Пожалуйста, введите действительное имя пользователя"
      },
      warning: {
        title: "СИСТЕМНОЕ ПРЕДУПРЕЖДЕНИЕ",
        message: "[ОСТОРОЖНО] Небезопасно для сердечников или хрупких эго. Действуйте на свой страх и риск! 😈"
      },
      footer: "Изготовлено с точностью. Доставлено без пощады.",
      languages: {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        hi: "हिंदी",
        ar: "العربية",
        ru: "Русский"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;