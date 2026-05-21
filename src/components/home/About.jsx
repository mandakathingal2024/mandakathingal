"use client";
import Image from "next/image";
import React from "react";
import { useStateContext } from "../../../context/stateContext";

const About = () => {
  const { isEnglish } = useStateContext();
  return (
    <section
      id="about"
      className="about"
      style={{ padding: "0px 0px", marginTop: "70px" }}
    >
      <div className="container">
        <div className="section-title">
          {/* <h2>
            {isEnglish ? `Mandakathingal Tharavad` : `മണ്ടകത്തിങ്ങൽ  തറവാട്`}{" "}
          </h2> */}

          {/* <p>
            {isEnglish
              ? `Welcome to Our Family Website

Hello and welcome to our family website! We are thrilled to have you visit and learn more about our family, our traditions, and the special moments we cherish together. 

Our family, rooted in love and togetherness, spans several generations and is a vibrant blend of diverse personalities, talents, and interests. We believe in the importance of family bonds and the joy that comes from spending time with one another, celebrating both the big milestones and the simple, everyday moments.

On this website, you'll find a glimpse into our lives through stories, photos, and updates about our latest adventures. Whether it's a holiday gathering, a birthday celebration, or just a Sunday afternoon barbecue, we love to capture and share the essence of our time together.

We invite you to explore our family tree to see where we come from, read our blog for personal anecdotes and family news, and browse our photo gallery to see the smiles and laughter that fill our days. Our family values openness, kindness, and support, and we hope to convey that spirit through this online space.

Thank you for stopping by and being a part of our family journey. We look forward to connecting with you and sharing the love that makes our family so special.`
              : `കുടുംബം (Kudimbam) എന്നാൽ സ്നേഹം, പരിചരണം, പിന്തുണ എന്നിവയുടെ അടിത്തറയിൽ കെട്ടുപാടുളള ഒരു യൂണിറ്റാണ്. രക്തബന്ധമുള്ള അംഗങ്ങൾ ചേർന്നാണ് കുടുംബം സാധാരണഗതിയിൽ നിർമ്മിക്കുന്നത്, അതിൽ മാതാപിതാക്കൾ, മക്കൾ, സഹോദരങ്ങൾ, മുത്തശ്ശിമാർ, മുത്തശ്ശാന്മാർ എന്നിവർ ഉൾപ്പെടാം. കുടുംബ ബന്ധങ്ങൾ വ്യക്തിജീവിതത്തിന്റെ അവിഭാജ്യ ഘടകമാണ്, അവ നമ്മുടെ വ്യക്തിത്വത്തെയും മൂല്യങ്ങളെയും രൂപപ്പെടുത്തുന്നു.`}
          </p> */}
        </div>

        <div className="row content" style={{ paddingBottom: "0px" }}>
          <div className="col-lg-6 about-img" >
            {/* <img src="/public/about.jpg" className="img-fluid" alt="image"/> */}
            <Image
              src={"/shibudinam.jpg"}
              width={550}
              height={380}
              layout="intrinsic"
              alt="image"
              style={{borderRadius:'20px'}}
            />
          </div>
          <div className="col-lg-6 pt-4 pt-lg-0">
            <h3>{isEnglish ? `Introduction` : `ആമുഖം`}</h3>

            <p>
              {isEnglish
                ? `Praise to the Lord of the Universe, the ocean of mercy. Fifteen years ago, after the Maghrib prayer (07/02/2009), a gathering was formed at the Megha Auditorium in Tirur Poongattu Kulam, with the participation of around seventy representatives from the surrounding areas. At that time, we never expected to reach this point. Our intention then was merely to lay the foundation for establishing connections, exploring roots, tracing branches, and introducing future generations to the lineage. For the past few years, the idea of introducing the generations that were once imprinted and etched in memory has been a constant inspiration.

I owe a debt of gratitude to Mujeeb (Babu), who provided the encouragement and motivation to bring this idea to fruition, to my nephew Shahin Hussain, who assisted me and filled the gap in information technology, which I had no knowledge of, and to Saleem Master, who offered his support. This souvenir has been prepared based on the information you have provided. With hope and faith, I humbly present this, believing it will serve as a valuable resource for future generations.`
                : ` കരുണാ വാരിധിയായ പ്രപഞ്ച നാഥാനു സ്തുതി. പതിനഞ്ചു വർഷങ്ങൾക്കു മുമ്പ്
              (07/02/2009) മഗ്‌രിബ് നമസ്കാരന്തരം പരിസര പ്രദേശങ്ങളിൽ വസിക്കുന്ന
              അറുപതോളം പ്രതിനിധികളെ പങ്കെടുപ്പിച്ചു തിരൂർ പൂങ്ങാട്ടുകുളം മെഘാ
              ഓഡിറ്റോറിയത്തിൽ വെച്ചു ഒരു കൂട്ടായ്മക്ക് രൂപം നൽകുമ്പോൾ ഇത്രത്തോളം
              എത്തുമെന്ന് പ്രതീക്ഷിച്ചതല്ല. വേരുകളിലേക്ക്‌ ആഴ്ന്നും, ശഘോപ
              ഷാഘകളിലേക്കു തിരിഞ്ഞും ബന്ധങ്ങൾ കണ്ടെത്തി, അവരെ അടുത്തറിഞ്ഞു വരും
              തലമുറയ്ക്ക് പരമ്പര പരിചയപ്പെടുത്തുക എന്ന ഉദ്ദേശത്തിന് നാന്ദി
              കുറിക്കുക മാത്രമായിരുന്നു അന്ന് ഉദ്ദേശിച്ചിരുന്നത്. കഴിഞ്ഞഏതാനും
              വർഷമായി മനസ്സിൽ നാമ്പിട്ട / കോറിയിട്ട പറമ്പരയെ പരിചയപ്പെടുത്തുക
              എന്ന ആശയം ഇതു വരെ എത്തിക്കാൻ പ്രചോദനവും പ്രോർത്സാഹനവും നൽകിയ
              മുജീബ് ( ബാബു ), വിവര സാങ്കേതിക വിദ്യ ഒട്ടും തന്നെ യില്ലാത്ത
              എനിക്ക് അതിന്റെ കുറവ് നികത്തി എന്നെ സഹായിച്ച സഹോദര പുത്രൻ ഷഹീൻ
              ഹുസൈൻ, പിന്തുണ വാഗ്ദാനം നൽകിയ സലീം മാസ്റ്റർ എന്നിവരോട്
              കടപ്പെട്ടിരിക്കുന്നു.. നിങ്ങൾ തരുന്ന വിവരങ്ങൾ അനുസരിച്ചാണ് ഈ
              സോവനീർ തയ്യാറാക്കിയിരിക്കുന്നത്. ഇത് വരും തലമുറക്ക് ഒരു മുതൽ
              കൂട്ട് ആകും എന്ന പ്രതീക്ഷയോടെ, വിശ്വാസതോടെ,സവിനയം`}
            </p>
            {isEnglish
              ? `I humbly present this before you.
Hamza Mandakathinkal,
Nishath Thalakkadathur`
              : `നിങ്ങളുടെ മുമ്പാകെ സമർപ്പിക്കുന്നു. ഹംസ മണ്ടകത്തിങ്കൽ, Nishath
              തലക്കടത്തൂർ`}
            <p></p>
            <a href="/our-story" className="btn-learn-more">
              {isEnglish?"Learn More":"കൂടുതലറിയുക"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
