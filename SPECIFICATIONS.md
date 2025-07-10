# Skjærgårdshelt - Technical Specifications & Collaboration Guide

## 🌊 Project Overview

**Skjærgårdshelt** is a Norwegian coastal cleanup gamification platform that combines social media engagement with comprehensive environmental data collection. The platform enables users to document their cleanup activities while building a valuable dataset for future integration with official Norwegian environmental databases.

### Mission Statement
To gamify coastal cleanup activities in Norway while collecting structured environmental data that can contribute to official reporting systems like rydde GraphQL-API, SSB (Statistics Norway), and Miljødirektoratet.

---

## 🎯 Core Features

### 1. **Social Cleanup Platform**
- **Post Creation**: Users document cleanup activities with photos, descriptions, and location data
- **Gamification**: Point-based system with levels and leaderboards
- **Social Features**: Like posts, follow cleanup activities, community engagement
- **User Profiles**: Track personal impact, points, and cleanup history

### 2. **Integrated Weight Estimation System**
- **Three Estimation Methods**:
  - **Bag Method**: Based on bag size and count with density factors
  - **Volume Method**: Dimensional measurements with packing efficiency
  - **Photo Method**: Reference object scaling for visual estimation
- **Real-time Calculation**: Instant weight estimates with confidence percentages
- **Seamless Integration**: Embedded directly in post creation flow

### 3. **Comprehensive Data Collection**
- **Environmental Conditions**: Weather, tide levels, accessibility ratings
- **Cleanup Details**: Duration, volunteer count, organization involvement
- **Waste Categorization**: Structured waste type classification
- **Geographic Data**: Location names, coordinates, administrative divisions
- **Photo Documentation**: Before/after/waste documentation arrays

### 4. **Future API Integration Framework**
- **Pre-formatted Data**: Ready for rydde, SSB, Miljødirektoratet APIs
- **Submission Queue**: Batch processing with retry logic
- **Status Tracking**: Monitor submission success/failure rates
- **Field Mapping**: Configurable mappings for different API requirements

---

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Context API
- **Image Processing**: Canvas API with WebP conversion
- **Authentication**: Supabase Auth

### **Backend Stack**
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage for images
- **API**: Next.js API routes
- **Authentication**: Row Level Security (RLS)
- **Real-time**: Supabase real-time subscriptions

### **Infrastructure**
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Domain**: Custom domain ready
- **SSL**: Automatic HTTPS

---

## 📊 Database Schema

### **Core Tables**

#### `profiles`
\`\`\`sql
- id: UUID (references auth.users)
- username: TEXT UNIQUE
- full_name: TEXT
- avatar_url: TEXT
- bio: TEXT
- points: INTEGER DEFAULT 0
- level: INTEGER DEFAULT 1
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
\`\`\`

#### `posts`
\`\`\`sql
- id: UUID PRIMARY KEY
- user_id: UUID (references auth.users)
- caption: TEXT
- image_url: TEXT
- location: TEXT
- waste_type: TEXT[]
- estimated_weight: DECIMAL
- points_earned: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
\`\`\`

#### `official_reports_queue`
\`\`\`sql
- id: UUID PRIMARY KEY
- post_id: UUID (references posts)
- user_id: UUID (references auth.users)
- location_name: TEXT
- coordinates: POINT
- cleanup_date: TIMESTAMP
- cleanup_duration_minutes: INTEGER
- volunteer_count: INTEGER
- waste_categories: JSONB
- total_weight_kg: DECIMAL
- weather_conditions: VARCHAR(100)
- tide_level: VARCHAR(50)
- accessibility_rating: INTEGER
- api_payload: JSONB
- status: VARCHAR(20) DEFAULT 'pending'
- external_ids: JSONB
- created_at: TIMESTAMP
\`\`\`

### **Supporting Tables**
- `likes`: User post interactions
- `waste_pickup`: Weight estimation metadata
- `bag_weights`: Standard bag weight references
- `density_factors`: Waste type density data
- `location_intelligence`: Cleanup hotspot analytics
- `user_activity_log`: User behavior tracking
- `api_integrations`: External API configurations

---

## 🔧 Key Components

### **Weight Estimation Engine**
\`\`\`typescript
// Three estimation methods with confidence scoring
interface WeightEstimation {
  method: 'bag' | 'volume' | 'photo'
  weightKg: number
  confidencePct: number
  metadata: Record<string, any>
}
\`\`\`

### **Data Collection Service**
\`\`\`typescript
// Comprehensive cleanup report creation
interface CleanupReportData {
  locationName?: string
  coordinates?: { lat: number; lng: number }
  cleanupDate: Date
  wasteCategories: WasteCategory[]
  totalWeightKg?: number
  volunteerCount?: number
  weatherConditions?: string
  // ... additional fields
}
\`\`\`

### **Image Processing Pipeline**
- **Multi-format Support**: JPEG, PNG, WebP, HEIC/HEIF
- **WebP Conversion**: 60-80% file size reduction
- **Dual Compression**: Primary + fallback methods
- **Quality Optimization**: Configurable compression levels

---

## 🌐 API Integration Readiness

### **Supported External APIs**

#### **Rydde GraphQL-API**
\`\`\`json
{
  "location": { "name": "...", "coordinates": "..." },
  "cleanup": { "date": "...", "participants": 3 },
  "waste": { "total_weight_kg": 5.2, "categories": [...] }
}
\`\`\`

#### **SSB (Statistics Norway)**
\`\`\`json
{
  "activity_date": "2024-01-15",
  "participant_count": 3,
  "waste_amount_kg": 5.2,
  "municipality": "Oslo"
}
\`\`\`

#### **Miljødirektoratet**
\`\`\`json
{
  "location": [59.9139, 10.7522],
  "environmental_data": {
    "waste_removed_kg": 5.2,
    "cleanup_date": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

## 📱 User Experience Flow

### **Post Creation Journey**
1. **Image Upload**: Select and compress cleanup photo
2. **Basic Info**: Add description and location
3. **Cleanup Details**: Volunteer count, duration, organization
4. **Waste Classification**: Select waste types found
5. **Weight Estimation**: Choose manual input or use estimator
   - **Bag Method**: Select bag size and count
   - **Volume Method**: Input dimensions with sliders
   - **Photo Method**: Upload reference object photo
6. **Advanced Details**: Weather, tide, accessibility (optional)
7. **Submit**: Create post and generate comprehensive report

### **Weight Estimation UX**
- **Progressive Enhancement**: Manual input remains default
- **Inline Integration**: No context switching required
- **Real-time Feedback**: Instant calculations with confidence
- **Method Switching**: Easy toggle between estimation types

---

## 🔒 Security & Privacy

### **Authentication**
- **Supabase Auth**: Email/password with social login options
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure session management

### **Data Protection**
- **GDPR Compliance**: User data control and deletion rights
- **Image Processing**: Client-side compression (no server processing)
- **API Security**: Rate limiting and input validation
- **Privacy Controls**: User profile visibility settings

---

## 📈 Analytics & Monitoring

### **User Activity Tracking**
- **Behavioral Analytics**: User interaction patterns
- **Cleanup Metrics**: Weight, location, frequency analysis
- **Engagement Tracking**: Feature usage and adoption rates
- **Performance Monitoring**: Image processing success rates

### **Environmental Impact Metrics**
- **Total Waste Collected**: Aggregated weight across all cleanups
- **Location Hotspots**: Most frequently cleaned areas
- **Seasonal Patterns**: Cleanup activity trends
- **Volunteer Engagement**: Group vs individual cleanup analysis

---

## 🚀 Deployment & DevOps

### **Current Deployment**
- **Production**: Vercel (auto-deploy from main branch)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (image CDN)
- **Domain**: Custom domain configured
- **SSL**: Automatic certificate management

### **Development Workflow**
- **Version Control**: Git with feature branches
- **CI/CD**: Vercel automatic deployments
- **Database Migrations**: SQL scripts in `/scripts` folder
- **Environment Management**: Vercel environment variables

---

## 🤝 Collaboration Opportunities

### **Technical Contributions**
- **Mobile App Development**: React Native or Flutter implementation
- **API Integrations**: Connect to official Norwegian databases
- **Advanced Analytics**: Machine learning for waste pattern analysis
- **Geolocation Services**: GPS integration and mapping features
- **Offline Capabilities**: PWA features for remote areas

### **Domain Expertise**
- **Environmental Science**: Waste categorization and impact assessment
- **Norwegian Regulations**: Compliance with environmental reporting standards
- **UX/UI Design**: User experience optimization
- **Community Management**: User engagement and retention strategies
- **Data Science**: Analytics and insights from cleanup data

### **Partnership Opportunities**
- **Environmental Organizations**: Hold Norge Rent, local cleanup groups
- **Government Agencies**: Miljødirektoratet, Statistics Norway
- **Research Institutions**: Environmental impact studies
- **Corporate Sponsors**: CSR partnerships and funding
- **Technology Partners**: API providers and infrastructure support

---

## 📋 Development Roadmap

### **Phase 1: Foundation** ✅ *Complete*
- [x] Core social platform functionality
- [x] Weight estimation system
- [x] Comprehensive data collection
- [x] Image processing pipeline
- [x] Database schema and API framework

### **Phase 2: Integration** 🔄 *In Progress*
- [ ] Official API connections (rydde, SSB, Miljødirektoratet)
- [ ] Advanced location services (GPS, mapping)
- [ ] Enhanced user profiles and achievements
- [ ] Community features (groups, challenges)

### **Phase 3: Scale** 📅 *Planned*
- [ ] Mobile applications (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Machine learning waste classification
- [ ] Corporate partnership portal
- [ ] Multi-language support

### **Phase 4: Impact** 🎯 *Future*
- [ ] Real-time environmental impact tracking
- [ ] Government reporting automation
- [ ] Research data export capabilities
- [ ] International expansion framework

---

## 🛠️ Getting Started for Collaborators

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Git for version control
- Supabase account (for database access)
- Vercel account (for deployment)

### **Local Development Setup**
\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/skjaergardshelt.git
cd skjaergardshelt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase keys and other config

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

### **Environment Variables Required**
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### **Contributing Guidelines**
1. **Fork the repository** and create feature branches
2. **Follow TypeScript** and ESLint configurations
3. **Write tests** for new functionality
4. **Update documentation** for API changes
5. **Submit pull requests** with detailed descriptions

---

## 📞 Contact & Support

### **Project Maintainer**
- **Email**: [your-email@domain.com]
- **GitHub**: [your-github-username]
- **LinkedIn**: [your-linkedin-profile]

### **Communication Channels**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Technical discussions and Q&A
- **Slack/Discord**: Real-time collaboration (invite-only)

### **Documentation**
- **API Documentation**: `/docs/api.md`
- **Database Schema**: `/docs/database.md`
- **Deployment Guide**: `/docs/deployment.md`
- **Contributing Guide**: `/CONTRIBUTING.md`

---

## 📄 License & Legal

### **Open Source License**
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Data Usage Policy**
- **User Data**: Collected with explicit consent for environmental reporting
- **Cleanup Data**: May be shared with official Norwegian environmental agencies
- **Privacy**: Users maintain control over their personal information
- **Research**: Anonymized data may be used for environmental research

### **Third-Party Services**
- **Supabase**: Database and authentication services
- **Vercel**: Hosting and deployment platform
- **External APIs**: Integration with Norwegian government databases

---

*Last Updated: January 2024*
*Version: 1.0.0*

---

**Ready to make a real environmental impact in Norway? Join us in building the future of coastal cleanup! 🌊♻️🇳🇴**
