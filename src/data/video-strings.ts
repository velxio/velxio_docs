// UI strings of the YouTube videos on the docs (YouTubeVideos.astro,
// VideoCatalog.astro), in the portal's nine locales. The video titles stay
// as they are on YouTube.

export interface VideoStrings {
  heading: string;
  intro: string;
  openExample: string;
  short: string;
  play: string;
  channel: string;
  allVideos: string;
  inDocs: string;
  start: string;
  more: string;
  pageIntro: string;
}

const STRINGS: Record<string, VideoStrings> = {
  en: {
    heading: "Videos",
    intro: "Watch it built and running in Velxio.",
    openExample: "Open the example",
    short: "Short",
    play: "Play",
    channel: "More on the Velxio YouTube channel",
    allVideos: "All videos",
    inDocs: "In the docs",
    start: "Getting started",
    more: "More",
    pageIntro:
      "Each video builds one project in Velxio, from the empty canvas to the running circuit. Under every video, Open the example loads the same project in the editor, so you can run it, change the code and wire your own version. The links under it go to the docs pages for its board and parts.",
  },
  es: {
    heading: "Videos",
    intro: "Míralo construido y funcionando en Velxio.",
    openExample: "Abrir el ejemplo",
    short: "Short",
    play: "Reproducir",
    channel: "Más en el canal de YouTube de Velxio",
    allVideos: "Todos los videos",
    inDocs: "En la documentación",
    start: "Empezar",
    more: "Más",
    pageIntro:
      "Cada video construye un proyecto en Velxio, desde el lienzo vacío hasta el circuito funcionando. Debajo de cada uno, Abrir el ejemplo carga ese mismo proyecto en el editor para que lo corras, cambies el código y armes tu propia versión. Los enlaces de abajo llevan a las páginas de su placa y sus componentes.",
  },
  "pt-br": {
    heading: "Vídeos",
    intro: "Veja montado e funcionando no Velxio.",
    openExample: "Abrir o exemplo",
    short: "Short",
    play: "Reproduzir",
    channel: "Mais no canal da Velxio no YouTube",
    allVideos: "Todos os vídeos",
    inDocs: "Na documentação",
    start: "Primeiros passos",
    more: "Mais",
    pageIntro:
      "Cada vídeo monta um projeto no Velxio, do canvas vazio ao circuito funcionando. Abaixo de cada um, Abrir o exemplo carrega o mesmo projeto no editor, para você executá-lo, mudar o código e montar a sua versão. Os links abaixo levam às páginas da placa e dos componentes.",
  },
  it: {
    heading: "Video",
    intro: "Guardalo costruito e in funzione in Velxio.",
    openExample: "Apri l'esempio",
    short: "Short",
    play: "Riproduci",
    channel: "Altro sul canale YouTube di Velxio",
    allVideos: "Tutti i video",
    inDocs: "Nella documentazione",
    start: "Per iniziare",
    more: "Altro",
    pageIntro:
      "Ogni video costruisce un progetto in Velxio, dalla tela vuota al circuito funzionante. Sotto ogni video, Apri l'esempio carica lo stesso progetto nell'editor, così puoi eseguirlo, cambiare il codice e cablare la tua versione. I link sotto portano alle pagine della scheda e dei componenti.",
  },
  fr: {
    heading: "Vidéos",
    intro: "Regardez-le construit et en marche dans Velxio.",
    openExample: "Ouvrir l'exemple",
    short: "Short",
    play: "Lire",
    channel: "Plus sur la chaîne YouTube de Velxio",
    allVideos: "Toutes les vidéos",
    inDocs: "Dans la documentation",
    start: "Premiers pas",
    more: "Plus",
    pageIntro:
      "Chaque vidéo construit un projet dans Velxio, du canevas vide au circuit en marche. Sous chaque vidéo, Ouvrir l'exemple charge le même projet dans l'éditeur : lancez-le, modifiez le code et câblez votre propre version. Les liens en dessous mènent aux pages de sa carte et de ses composants.",
  },
  "zh-cn": {
    heading: "视频",
    intro: "观看它在 Velxio 中搭建和运行的过程。",
    openExample: "打开示例",
    short: "短视频",
    play: "播放",
    channel: "在 Velxio 的 YouTube 频道上观看更多",
    allVideos: "全部视频",
    inDocs: "相关文档",
    start: "入门",
    more: "更多",
    pageIntro:
      "每个视频都在 Velxio 中从空白画布搭建一个项目，直到电路运行起来。每个视频下方的“打开示例”会在编辑器中加载同一个项目，你可以运行它、修改代码并连接自己的版本。下方的链接指向其开发板和元件的文档页面。",
  },
  de: {
    heading: "Videos",
    intro: "Sieh zu, wie es in Velxio aufgebaut wird und läuft.",
    openExample: "Beispiel öffnen",
    short: "Short",
    play: "Abspielen",
    channel: "Mehr auf dem YouTube-Kanal von Velxio",
    allVideos: "Alle Videos",
    inDocs: "In der Dokumentation",
    start: "Erste Schritte",
    more: "Mehr",
    pageIntro:
      "Jedes Video baut ein Projekt in Velxio auf, von der leeren Arbeitsfläche bis zur laufenden Schaltung. Unter jedem Video lädt „Beispiel öffnen“ dasselbe Projekt in den Editor, damit du es ausführen, den Code ändern und deine eigene Version verdrahten kannst. Die Links darunter führen zu den Seiten seines Boards und seiner Bauteile.",
  },
  ja: {
    heading: "動画",
    intro: "Velxio で組み立てて動かす様子をご覧ください。",
    openExample: "サンプルを開く",
    short: "ショート",
    play: "再生",
    channel: "Velxio の YouTube チャンネルでもっと見る",
    allVideos: "すべての動画",
    inDocs: "ドキュメント",
    start: "はじめに",
    more: "その他",
    pageIntro:
      "各動画では、空のキャンバスから回路が動くまで、Velxio でプロジェクトを 1 つ組み立てます。各動画の下の「サンプルを開く」で同じプロジェクトがエディターに読み込まれるので、実行したり、コードを変えたり、自分の配線を試したりできます。その下のリンクは、ボードと部品のドキュメントページにつながります。",
  },
  ru: {
    heading: "Видео",
    intro: "Посмотрите, как это собирается и работает в Velxio.",
    openExample: "Открыть пример",
    short: "Shorts",
    play: "Воспроизвести",
    channel: "Больше на YouTube-канале Velxio",
    allVideos: "Все видео",
    inDocs: "В документации",
    start: "Начало работы",
    more: "Ещё",
    pageIntro:
      "Каждое видео собирает один проект в Velxio, от пустого холста до работающей схемы. Под каждым видео «Открыть пример» загружает тот же проект в редактор, чтобы вы могли запустить его, изменить код и собрать свою версию. Ссылки под ним ведут на страницы его платы и компонентов.",
  },
};

export const DOCS_LOCALES = ["es", "pt-br", "it", "fr", "zh-cn", "de", "ja", "ru"];

/** The locale key of a BCP-47 tag ("pt-BR" -> "pt-br", "en-US" -> "en"). */
export function localeKey(lang: string | undefined): string {
  const l = (lang ?? "en").toLowerCase();
  if (STRINGS[l]) return l;
  const base = l.split("-")[0];
  return STRINGS[base] ? base : "en";
}

export function videoStrings(lang: string | undefined): VideoStrings {
  return STRINGS[localeKey(lang)];
}

export const ALL_STRINGS = STRINGS;

/**
 * The reader's language first, then long videos before Shorts, otherwise the
 * catalog's order (newest first). The app orders an example's videos the
 * same way.
 */
export function forReader<T extends { lang: string; kind: string }>(videos: T[], lang: string | undefined): T[] {
  const want = localeKey(lang).split("-")[0];
  const rank = (v: T) => (localeKey(v.lang).split("-")[0] === want ? 0 : 2) + (v.kind === "long" ? 0 : 1);
  return videos
    .map((v, i) => ({ v, i }))
    .sort((a, b) => rank(a.v) - rank(b.v) || a.i - b.i)
    .map(({ v }) => v);
}
