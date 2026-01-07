import { FormSnapshot, TemplateCategory } from "@/lib/db/schema";

interface SeedTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
  isFeatured: boolean;
  snapshot: FormSnapshot;
}

export const seedTemplates: SeedTemplate[] = [
  // Customer Satisfaction Survey
  {
    name: "Customer Satisfaction Survey",
    description: "Measure customer satisfaction and gather feedback about your products or services.",
    category: "surveys",
    isFeatured: true,
    snapshot: {
      title: "Customer Satisfaction Survey",
      description: "We value your feedback! Please take a moment to share your experience with us.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "rating",
          title: "How satisfied are you with our product/service overall?",
          required: true,
          order: 0,
          settings: { maxRating: 5, ratingType: "star" },
        },
        {
          id: "q2",
          type: "single_choice",
          title: "How likely are you to recommend us to a friend or colleague?",
          required: true,
          order: 1,
          settings: {},
          options: [
            { id: "o1", value: "Very Likely", order: 0 },
            { id: "o2", value: "Likely", order: 1 },
            { id: "o3", value: "Neutral", order: 2 },
            { id: "o4", value: "Unlikely", order: 3 },
            { id: "o5", value: "Very Unlikely", order: 4 },
          ],
        },
        {
          id: "q3",
          type: "multiple_choice",
          title: "What aspects of our service do you value most?",
          required: false,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Quality", order: 0 },
            { id: "o2", value: "Price", order: 1 },
            { id: "o3", value: "Customer Support", order: 2 },
            { id: "o4", value: "Speed of Delivery", order: 3 },
            { id: "o5", value: "Ease of Use", order: 4 },
          ],
        },
        {
          id: "q4",
          type: "long_text",
          title: "What could we do to improve your experience?",
          required: false,
          order: 3,
          settings: { placeholder: "Share your thoughts..." },
        },
      ],
    },
  },

  // Event Registration Form
  {
    name: "Event Registration",
    description: "Collect attendee information for conferences, workshops, or meetups.",
    category: "registration",
    isFeatured: true,
    snapshot: {
      title: "Event Registration",
      description: "Register for our upcoming event. Limited spots available!",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "short_text",
          title: "Full Name",
          required: true,
          order: 0,
          settings: { placeholder: "Enter your full name" },
        },
        {
          id: "q2",
          type: "email",
          title: "Email Address",
          required: true,
          order: 1,
          settings: { placeholder: "you@example.com" },
        },
        {
          id: "q3",
          type: "phone",
          title: "Phone Number",
          required: false,
          order: 2,
          settings: {},
        },
        {
          id: "q4",
          type: "single_choice",
          title: "Which session would you like to attend?",
          required: true,
          order: 3,
          settings: {},
          options: [
            { id: "o1", value: "Morning Session (9 AM - 12 PM)", order: 0 },
            { id: "o2", value: "Afternoon Session (2 PM - 5 PM)", order: 1 },
            { id: "o3", value: "Full Day", order: 2 },
          ],
        },
        {
          id: "q5",
          type: "multiple_choice",
          title: "Dietary requirements",
          required: false,
          order: 4,
          settings: {},
          options: [
            { id: "o1", value: "None", order: 0 },
            { id: "o2", value: "Vegetarian", order: 1 },
            { id: "o3", value: "Vegan", order: 2 },
            { id: "o4", value: "Gluten-free", order: 3 },
            { id: "o5", value: "Other", order: 4 },
          ],
        },
      ],
    },
  },

  // Contact Us Form
  {
    name: "Contact Us",
    description: "Simple contact form for customers to reach out with questions or inquiries.",
    category: "contact",
    isFeatured: true,
    snapshot: {
      title: "Contact Us",
      description: "Have a question? We'd love to hear from you!",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "short_text",
          title: "Your Name",
          required: true,
          order: 0,
          settings: {},
        },
        {
          id: "q2",
          type: "email",
          title: "Email Address",
          required: true,
          order: 1,
          settings: {},
        },
        {
          id: "q3",
          type: "single_choice",
          title: "What is your inquiry about?",
          required: true,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "General Inquiry", order: 0 },
            { id: "o2", value: "Sales", order: 1 },
            { id: "o3", value: "Support", order: 2 },
            { id: "o4", value: "Partnership", order: 3 },
          ],
        },
        {
          id: "q4",
          type: "long_text",
          title: "Your Message",
          required: true,
          order: 3,
          settings: { placeholder: "Tell us how we can help..." },
        },
      ],
    },
  },

  // Employee Feedback Survey
  {
    name: "Employee Feedback Survey",
    description: "Gather feedback from team members about workplace satisfaction.",
    category: "feedback",
    isFeatured: false,
    snapshot: {
      title: "Employee Feedback Survey",
      description: "Your feedback helps us create a better workplace. All responses are anonymous.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "rating",
          title: "How satisfied are you with your current role?",
          required: true,
          order: 0,
          settings: { maxRating: 10, ratingType: "number" },
        },
        {
          id: "q2",
          type: "rating",
          title: "How would you rate the work-life balance at our company?",
          required: true,
          order: 1,
          settings: { maxRating: 5, ratingType: "star" },
        },
        {
          id: "q3",
          type: "single_choice",
          title: "Do you feel your work is recognized?",
          required: true,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Always", order: 0 },
            { id: "o2", value: "Usually", order: 1 },
            { id: "o3", value: "Sometimes", order: 2 },
            { id: "o4", value: "Rarely", order: 3 },
            { id: "o5", value: "Never", order: 4 },
          ],
        },
        {
          id: "q4",
          type: "long_text",
          title: "What improvements would you suggest?",
          required: false,
          order: 3,
          settings: {},
        },
      ],
    },
  },

  // Quiz Template
  {
    name: "Knowledge Quiz",
    description: "Test knowledge with a multiple-choice quiz format.",
    category: "quizzes",
    isFeatured: true,
    snapshot: {
      title: "Knowledge Quiz",
      description: "Test your knowledge! Answer the following questions to the best of your ability.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "short_text",
          title: "Enter your name",
          required: true,
          order: 0,
          settings: {},
        },
        {
          id: "q2",
          type: "single_choice",
          title: "What is the capital of France?",
          required: true,
          order: 1,
          settings: {},
          options: [
            { id: "o1", value: "London", order: 0 },
            { id: "o2", value: "Paris", order: 1 },
            { id: "o3", value: "Berlin", order: 2 },
            { id: "o4", value: "Madrid", order: 3 },
          ],
        },
        {
          id: "q3",
          type: "single_choice",
          title: "Which planet is known as the Red Planet?",
          required: true,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Venus", order: 0 },
            { id: "o2", value: "Mars", order: 1 },
            { id: "o3", value: "Jupiter", order: 2 },
            { id: "o4", value: "Saturn", order: 3 },
          ],
        },
        {
          id: "q4",
          type: "single_choice",
          title: "What year did World War II end?",
          required: true,
          order: 3,
          settings: {},
          options: [
            { id: "o1", value: "1943", order: 0 },
            { id: "o2", value: "1944", order: 1 },
            { id: "o3", value: "1945", order: 2 },
            { id: "o4", value: "1946", order: 3 },
          ],
        },
      ],
    },
  },

  // Job Application Form
  {
    name: "Job Application",
    description: "Collect applications from potential candidates for open positions.",
    category: "applications",
    isFeatured: false,
    snapshot: {
      title: "Job Application",
      description: "Thank you for your interest in joining our team!",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "short_text",
          title: "Full Name",
          required: true,
          order: 0,
          settings: {},
        },
        {
          id: "q2",
          type: "email",
          title: "Email Address",
          required: true,
          order: 1,
          settings: {},
        },
        {
          id: "q3",
          type: "phone",
          title: "Phone Number",
          required: true,
          order: 2,
          settings: {},
        },
        {
          id: "q4",
          type: "single_choice",
          title: "Position you are applying for",
          required: true,
          order: 3,
          settings: {},
          options: [
            { id: "o1", value: "Software Engineer", order: 0 },
            { id: "o2", value: "Product Designer", order: 1 },
            { id: "o3", value: "Marketing Manager", order: 2 },
            { id: "o4", value: "Sales Representative", order: 3 },
          ],
        },
        {
          id: "q5",
          type: "url",
          title: "LinkedIn Profile",
          required: false,
          order: 4,
          settings: { placeholder: "https://linkedin.com/in/yourprofile" },
        },
        {
          id: "q6",
          type: "long_text",
          title: "Why are you interested in this position?",
          required: true,
          order: 5,
          settings: {},
        },
      ],
    },
  },

  // Product Feedback Form
  {
    name: "Product Feedback",
    description: "Gather detailed feedback about specific product features.",
    category: "feedback",
    isFeatured: false,
    snapshot: {
      title: "Product Feedback",
      description: "Help us improve our product by sharing your experience.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "single_choice",
          title: "Which product are you providing feedback for?",
          required: true,
          order: 0,
          settings: {},
          options: [
            { id: "o1", value: "Product A", order: 0 },
            { id: "o2", value: "Product B", order: 1 },
            { id: "o3", value: "Product C", order: 2 },
          ],
        },
        {
          id: "q2",
          type: "rating",
          title: "How would you rate this product overall?",
          required: true,
          order: 1,
          settings: { maxRating: 5, ratingType: "star" },
        },
        {
          id: "q3",
          type: "multiple_choice",
          title: "What do you like most about this product?",
          required: false,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Design", order: 0 },
            { id: "o2", value: "Functionality", order: 1 },
            { id: "o3", value: "Price", order: 2 },
            { id: "o4", value: "Quality", order: 3 },
          ],
        },
        {
          id: "q4",
          type: "long_text",
          title: "What improvements would you suggest?",
          required: false,
          order: 3,
          settings: {},
        },
      ],
    },
  },

  // Newsletter Signup
  {
    name: "Newsletter Signup",
    description: "Simple form to collect newsletter subscribers.",
    category: "leads",
    isFeatured: false,
    snapshot: {
      title: "Subscribe to Our Newsletter",
      description: "Stay updated with our latest news and offers!",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "email",
          title: "Email Address",
          required: true,
          order: 0,
          settings: { placeholder: "you@example.com" },
        },
        {
          id: "q2",
          type: "short_text",
          title: "First Name",
          required: false,
          order: 1,
          settings: {},
        },
        {
          id: "q3",
          type: "multiple_choice",
          title: "What topics interest you?",
          required: false,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Product Updates", order: 0 },
            { id: "o2", value: "Tips & Tutorials", order: 1 },
            { id: "o3", value: "Industry News", order: 2 },
            { id: "o4", value: "Special Offers", order: 3 },
          ],
        },
      ],
    },
  },

  // Research Survey
  {
    name: "Market Research Survey",
    description: "Comprehensive survey for market research and consumer insights.",
    category: "research",
    isFeatured: false,
    snapshot: {
      title: "Market Research Survey",
      description: "Help us understand your needs and preferences better.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "single_choice",
          title: "What is your age group?",
          required: true,
          order: 0,
          settings: {},
          options: [
            { id: "o1", value: "18-24", order: 0 },
            { id: "o2", value: "25-34", order: 1 },
            { id: "o3", value: "35-44", order: 2 },
            { id: "o4", value: "45-54", order: 3 },
            { id: "o5", value: "55+", order: 4 },
          ],
        },
        {
          id: "q2",
          type: "single_choice",
          title: "How often do you purchase products in this category?",
          required: true,
          order: 1,
          settings: {},
          options: [
            { id: "o1", value: "Weekly", order: 0 },
            { id: "o2", value: "Monthly", order: 1 },
            { id: "o3", value: "Quarterly", order: 2 },
            { id: "o4", value: "Yearly", order: 3 },
            { id: "o5", value: "Rarely", order: 4 },
          ],
        },
        {
          id: "q3",
          type: "multiple_choice",
          title: "What factors influence your purchasing decisions?",
          required: true,
          order: 2,
          settings: {},
          options: [
            { id: "o1", value: "Price", order: 0 },
            { id: "o2", value: "Brand", order: 1 },
            { id: "o3", value: "Reviews", order: 2 },
            { id: "o4", value: "Recommendations", order: 3 },
            { id: "o5", value: "Advertising", order: 4 },
          ],
        },
        {
          id: "q4",
          type: "rating",
          title: "How important is sustainability in your purchasing decisions?",
          required: true,
          order: 3,
          settings: { maxRating: 5, ratingType: "star" },
        },
      ],
    },
  },

  // Order Form
  {
    name: "Order Form",
    description: "Simple order form for products or services.",
    category: "orders",
    isFeatured: false,
    snapshot: {
      title: "Order Form",
      description: "Fill out this form to place your order.",
      settings: {},
      questions: [
        {
          id: "q1",
          type: "short_text",
          title: "Full Name",
          required: true,
          order: 0,
          settings: {},
        },
        {
          id: "q2",
          type: "email",
          title: "Email Address",
          required: true,
          order: 1,
          settings: {},
        },
        {
          id: "q3",
          type: "phone",
          title: "Phone Number",
          required: true,
          order: 2,
          settings: {},
        },
        {
          id: "q4",
          type: "long_text",
          title: "Shipping Address",
          required: true,
          order: 3,
          settings: {},
        },
        {
          id: "q5",
          type: "single_choice",
          title: "Select Product",
          required: true,
          order: 4,
          settings: {},
          options: [
            { id: "o1", value: "Product A - $29.99", order: 0 },
            { id: "o2", value: "Product B - $49.99", order: 1 },
            { id: "o3", value: "Product C - $79.99", order: 2 },
          ],
        },
        {
          id: "q6",
          type: "number",
          title: "Quantity",
          required: true,
          order: 5,
          settings: { min: 1, max: 10 },
        },
      ],
    },
  },
];

// Function to seed templates into the database
export async function seedTemplatesIntoDb(db: unknown, formTemplates: unknown) {
  // Implementation would insert each template into the database
  // This is called from a setup script or admin action
  console.log("Seeding templates...", { db, formTemplates });
}
