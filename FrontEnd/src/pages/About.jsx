import { FiTarget, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

const About = () => {
  const stats = [
    { label: 'Active Users', value: '50,000+' },
    { label: 'Jobs Posted', value: '10,000+' },
    { label: 'Companies', value: '5,000+' },
    { label: 'Placements', value: '25,000+' },
  ];

  const values = [
    {
      icon: FiTarget,
      title: 'Our Mission',
      description: 'To connect talented individuals with their dream careers and help companies find the perfect talent.'
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Building a trusted community of job seekers and employers who share our vision of professional growth.'
    },
    {
      icon: FiAward,
      title: 'Excellence',
      description: 'Striving for excellence in everything we do, from user experience to customer service.'
    },
    {
      icon: FiHeart,
      title: 'Integrity',
      description: 'Maintaining the highest standards of honesty and transparency in all our operations.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16">
        <div className="container-app text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="gradient-text">JobPortal</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We are on a mission to transform the way people find jobs and companies hire talent. 
            Our platform bridges the gap between ambition and opportunity.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Our Story</h2>
            <div className="prose dark:prose-invert mx-auto">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                JobPortal was founded in 2020 with a simple vision: to make job searching and hiring 
                as seamless as possible. What started as a small team with big dreams has grown into 
                one of the leading job portals in the country.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                We believe that finding the right job shouldn't be a struggle. Our AI-powered platform 
                matches candidates with opportunities that align with their skills, experience, and career goals. 
                At the same time, we help employers find the perfect fit for their teams.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                Today, we are proud to have helped thousands of individuals find their dream jobs and 
                assisted hundreds of companies in building their dream teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you're looking for your dream job or seeking talented professionals, 
            we're here to help you succeed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Get Started
            </a>
            <a href="/contact" className="btn border-2 border-white text-white hover:bg-white/10">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

