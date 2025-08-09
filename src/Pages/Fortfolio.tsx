import { useState, useEffect, Suspense, lazy } from "react";
import { useInView } from "react-intersection-observer";
import Sidebar from "../header-footer/Sidebar";
import Hero from "./Components/HeroSection";
import { useParams } from "react-router-dom";

// Lazy load components
const ProfilePage = lazy(() => import("./Components/Profiles"));
const SkillPage = lazy(() => import("./Components/Skill"));
const Education = lazy(() => import("./Components/Education"));
const ProjectPage = lazy(() => import("./Components/Project"));
const ExperiencePage = lazy(() => import("./Components/Experiences"));
const ContactSection = lazy(() => import("./Components/Contact"));

interface props {
   isLogin: boolean;
   
}

const PortfolioHomePage = ({ isLogin }: props) => {
  const [activeSection, setActiveSection] = useState("hero");
  const { userId } = useParams(); 
  // Thiết lập chung cho react-intersection-observer
  const options = { threshold: 0.5, triggerOnce: false };

  // Khai báo useInView cho từng section một cách tường minh
  const { ref: heroRef, inView: heroInView } = useInView(options);
  const { ref: profileRef, inView: profileInView } = useInView(options);
  const { ref: skillRef, inView: skillInView } = useInView(options);
  const { ref: educationRef, inView: educationInView } = useInView(options);
  const { ref: projectRef, inView: projectInView } = useInView(options);
  const { ref: experienceRef, inView: experienceInView } = useInView(options);
  const { ref: contactRef, inView: contactInView } = useInView(options);

  // Một useEffect duy nhất để quản lý activeSection
  // Logic này đảm bảo chỉ section ưu tiên cao nhất (ở dưới cùng) được chọn
  useEffect(() => {
    if (contactInView) {
      setActiveSection("contact");
    } else if (experienceInView) {
      setActiveSection("experience");
    } else if (projectInView) {
      setActiveSection("project");
    } else if (educationInView) {
      setActiveSection("education");
    } else if (skillInView) {
      setActiveSection("skill");
    } else if (profileInView) {
      setActiveSection("profile");
    } else if (heroInView) {
      setActiveSection("hero");
    }
  }, [
    heroInView,
    profileInView,
    skillInView,
    educationInView,
    projectInView,
    experienceInView,
    contactInView,
  ]);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar */}
        <div className="col-lg-3 col-md-4 p-0">
          <Sidebar activeSection={activeSection} isLogin={isLogin} userId={userId || ""} />
        </div>

        {/* Main Content */}
        <main className="col-lg-9 col-md-8 p-0" style={{ backgroundColor: "#181824", color: "#e0e0e0" }}>
          {/* Gán ref và id cho mỗi section */}
          <section id="hero" ref={heroRef}>
            <Hero isLogin={isLogin} userId={userId || "" }/>
          </section>
          
          <section id="profile" ref={profileRef}>
             <Suspense fallback={<div className="text-center py-5">Loading Profile...</div>}>
                <ProfilePage isLogin={isLogin} userId={userId || "" } />
             </Suspense>
          </section>
          
          {/* Lặp lại cho các section còn lại */}
          <section id="skill" ref={skillRef}>
            <Suspense fallback={<div className="text-center py-5">Loading Skills...</div>}>
              <SkillPage  isLogin={isLogin} userId={userId || "" } />
            </Suspense>
          </section>
          
          <section id="education" ref={educationRef}>
            <Suspense fallback={<div className="text-center py-5">Loading Education...</div>}>
              <Education isLogin={isLogin} userId={userId || "" } />
            </Suspense>
          </section>

          <section id="project" ref={projectRef}>
            <Suspense fallback={<div className="text-center py-5">Loading Projects...</div>}>
              <ProjectPage isLogin={isLogin} userId={userId || "" } />
            </Suspense>
          </section>

          <section id="experience" ref={experienceRef}>
            <Suspense fallback={<div className="text-center py-5">Loading Experience...</div>}>
              <ExperiencePage  isLogin={isLogin} userId={userId || "" } />
            </Suspense>
          </section>
          
          <section id="contact" ref={contactRef}>
            <Suspense fallback={<div className="text-center py-5">Loading Contact...</div>}>
              <ContactSection   isLogin={isLogin} userId={userId || "" } />
            </Suspense>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PortfolioHomePage;