
import AboutSection from "./components/aboutSection";
import HowItWorks from "./components/howItWork";
import { HeroSection } from "./components/mainPage";
import Footer from "./components/footer";

export default function Home() {
  return (
    <><HeroSection/>
    <AboutSection/>
    <HowItWorks/>
    <Footer/>
    </>
  );
}
