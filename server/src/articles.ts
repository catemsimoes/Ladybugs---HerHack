import type { Article } from '@shared/types';


export const TRAINING_ARTICLES: Article[] = [
  {
    title: "Happy Halloween! Celebrating in the USA",
    content: "Halloween is a major tradition in the USA, celebrated with carved pumpkins and lots of candy. An American family living in Switzerland shares how they celebrate. Kids go door-to-door saying “Trick or Treat!” to collect sweets. This custom, rooted in Europe, has become a grand event in America, featuring elaborate decorations. Other American traditions, like Black Friday and Thanksgiving, are also growing in popularity in Switzerland.",
    url: "https://www.srf.ch/kids/",
    correctTag: "TRUTH",
    clues: [
      "Source: SRF is a trusted media outlet that informs viewers about cultural events",
      "Is it news or an ad? It's news; it provides information about Halloween traditions rather than promoting a product"
    ]
    // - **Clues for Kids**:
    //     - **Source:** SRF is a trusted media outlet that informs viewers about cultural events.
    //     - **Is it news or an ad?** It’s news; it provides information about Halloween traditions rather than promoting a product.
  },
  {
    title: "Eating 100 Apples in a Day Will Make You Super Strong",
    content: "A recent study by 'The Super Health Institute' claims that eating 100 apples in a single day will instantly make you as strong as a professional weightlifter! The article encourages children to eat as many apples as possible to build up their strength quickly.",
    url: "www.healthmagic4kids.com",
    correctTag: "FAKE",
    clues: [
      "Sensational language",
      "Unrealistic health claims",
      "Lack of credible sources (no real institute mentioned)"
    ]
    // - **Clues for kids**: Sensational language, unrealistic health claims, and lack of credible sources (no real institute mentioned).
  }
]

export const PLAY_ARTICLES: Article[] = [
  {
    title: "New Law: Students Must Attend School on Saturdays Starting Next Month!",
    content: "This 'breaking news' article states that Swiss lawmakers have passed a law requiring students to attend school six days a week. Officials say it will make Switzerland the smartest country in the world, although no details are provided about how the law will be enforced.",
    url: "www.educationlawnews.ch",
    correctTag: "FAKE:_UNRELIABLE_SOURCE"
    // - **Clues for kids**: Lack of specific lawmakers, unusual policy with no credible details, and a grand claim without evidence.
    // **Choices for the Students**:
      // 1. **True**
      // 2. **Fake: All-Caps Title**
      // 3. **Fake: Emotional Language**
      // 4. **Fake: Unreliable Source**
  },
  {
    title: "Win Tickets to Zauberpark at Zurich Airport!",
    content: "If you enjoy music and concerts, you're in luck! Zauberpark at Zurich Airport will feature performances by artists like Bligg, Silberbüx, and Laurent & Max, along with exciting light installations and workshops. Enter the contest by November 21, 2024, for a chance to win tickets. Make sure to get your parents' permission and ensure you can attend on the concert day.",
    url: "srf.ch/kids/zauberpark-contest",
    correctTag: "TRUTH"
    // - **Clues for Kids**:
    //     - **Source:** SRF Kids, a credible news source.
    //     - **Is this actual news or an ad?** It’s a contest announcement, clearly indicated as part of an event promotion.
    //     - **Audience?** Kids and families interested in entertainment events in Switzerland.
  },
  {
    title: "Aliens SPOTTED in SWISS LAKE – Locals SHOCKED!",
    content: "Residents around Lake Geneva reportedly saw glowing green lights under the water late last night, with some witnesses claiming to see aliens swimming! Locals are scared, but 'experts' suggest it could be a government experiment.",
    url: "www.realswissnews.ch",
    correctTag: "FAKE:_ALL_CAPS_TITLE"
    // - **Clues for kids**: No credible names, exaggerated story, and vague “expert” sources.
    // **Choices for the Students**:
      // 1. **True**
      // 2. **Fake: All-Caps Title**
      // 3. **Fake: Blurry Photo**
      // 4. **Fake: Threatening Language**
  },
  {
    title: "Dinosaurs Are Being Cloned for Swiss Zoos!",
    content: "According to the article, Swiss scientists are working hard in a secret lab to bring dinosaurs back to life. By next year, they hope to have a baby T-Rex on display in a zoo in Zurich! A blurry photo of a 'baby dinosaur' accompanies the article.",
    url: "www.newwildlifereports.com",
    correctTag: "FAKE:_UNRELIABLE_SOURCE" // it's more a lack of credible source
    // - **Clues for kids**: Fictional science, lack of real names or research institutions, and dubious photo quality.
    // **Choices for the Students**:
      // 1. **True**
      // 2. **Fake: Lack of credible sources**
      // 3. **Fake: Emotional Language**
      // 4. **Fake: All-caps title**
  },
]