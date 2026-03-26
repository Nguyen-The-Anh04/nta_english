import MainLayout from "../layouts/MainLayout";
import Slider from "../components/Slider";
import About from "../components/About";
import Courses from "../components/Courses";
import Roadmap from "../components/Roadmap";
import Teachers from "../components/Teachers";
import Feedback from "../components/Feedback";
import CTAForm from "../components/CTAForm";

function Home() {
  return (
    <MainLayout>
      {/* Hero Section with Slider */}
      <div id="home" style={{ marginTop: 70 }}>
        <Slider />
      </div>

      {/* About Section */}
      <About />

      {/* Courses Section */}
      <Courses />

      {/* Roadmap Section */}
      <Roadmap />

      {/* Teachers Section */}
      <Teachers />

      {/* Feedback Section */}
      <Feedback />

      {/* CTA Section */}
      <CTAForm />
    </MainLayout>
  );
}

export default Home;
