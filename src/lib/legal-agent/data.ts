import { Question, Option } from "./types";

export const QUESTIONS: Record<string, Question> = {
    "Q1": {
        id: "Q1",
        text: "Are you starting a standard business for profit, or a non-profit organization (Charity/NGO)?",
        options: [
            {
                id: "BUSINESS",
                text: "Business for Profit",
                impacts: [],
                nextQuestionId: "Q2B"
            },
            {
                id: "CHARITY",
                text: "Non-Profit / Charity / NGO",
                impacts: [],
                nextQuestionId: "Q2C" // Placeholder for Charity path
            }
        ]
    },

    // --- BUSINESS PATH (Q2B - Q13B) ---

    "Q2B": {
        id: "Q2B",
        text: "Which of the following best describes your work?",
        options: [
            { id: "FREELANCER", text: "Freelancer (Writing, coding, design, consulting)", impacts: [{ entity: "Sole Proprietorship", score: 35 }] },
            { id: "CONTENT_CREATOR", text: "Content Creator (YouTuber, Influencer)", impacts: [{ entity: "Sole Proprietorship", score: 35 }] },
            { id: "SOLO_SERVICE", text: "Solo Service (Tutor, trainer, etc.)", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 10 }] },
            { id: "TRADING", text: "Trading/Reselling Goods", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }] },
            { id: "BUILDING_COMPANY", text: "Building a Company (Team, brand, growth)", impacts: [{ entity: "Private Limited Company", score: 35 }, { entity: "LLP", score: 20 }] },
        ]
    },

    "Q3B": {
        id: "Q3B",
        text: "What stage is your business currently at?",
        options: [
            { id: "IDEA", text: "Just an Idea", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 15 }] },
            { id: "TESTING", text: "Testing the Market", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "OPC", score: 20 }] },
            { id: "EARNING", text: "Earning Some Money", impacts: [{ entity: "LLP", score: 25 }, { entity: "Private Limited Company", score: 25 }, { entity: "OPC", score: 15 }] },
            { id: "RUNNING_WELL", text: "Running Well & Growing", impacts: [{ entity: "Private Limited Company", score: 30 }, { entity: "LLP", score: 20 }] },
        ]
    },

    "Q4B": {
        id: "Q4B",
        text: "How soon do you want to start your business?",
        options: [
            { id: "URGENT", text: "Today or Tomorrow (Urgent)", impacts: [{ entity: "Sole Proprietorship", score: 40 }] }, // Others -20 handled in logic engine or implied low relative score
            { id: "THIS_WEEK", text: "This Week", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Partnership Firm", score: 15 }, { entity: "LLP", score: 5 }, { entity: "OPC", score: 5 }, { entity: "Private Limited Company", score: 5 }] },
            { id: " फ्यू_WEEKS", text: "2-3 Weeks is Okay", impacts: [{ entity: "Private Limited Company", score: 10 }, { entity: "LLP", score: 10 }] },
            { id: "NO_RUSH", text: "No Rush (Planning ahead)", impacts: [{ entity: "Private Limited Company", score: 15 }] },
        ]
    },

    "Q5B": {
        id: "Q5B",
        text: "How many people will own/run this business?",
        options: [
            { id: "JUST_ME", text: "Just Me (Solo)", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 30 }, { entity: "Private Limited Company", score: -5 }] },
            { id: "TWO_PEOPLE", text: "Me and One Partner", impacts: [{ entity: "LLP", score: 25 }, { entity: "Private Limited Company", score: 25 }, { entity: "Partnership Firm", score: 20 }] },
            { id: "SMALL_TEAM", text: "Small Team (3-5 people)", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 20 }] },
            { id: "LARGE_GROUP", text: "Larger Group (6+ people)", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "Public Limited Company", score: 15 }] },
        ]
    },

    "Q6B": {
        id: "Q6B",
        text: "Do you want your personal assets (home, savings) protected from business risks? (Limited Liability)",
        options: [
            { id: "MUST_PROTECT", text: "Yes, Must be Protected", impacts: [{ entity: "Private Limited Company", score: 35 }, { entity: "LLP", score: 30 }, { entity: "OPC", score: 25 }] },
            { id: "NOT_WORRIED", text: "Not Worried / Low Risk", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "Partnership Firm", score: 20 }] },
            { id: "NOT_SURE", text: "Not Sure", impacts: [{ entity: "Private Limited Company", score: 20 }, { entity: "LLP", score: 20 }] },
        ]
    },

    "Q7B": {
        id: "Q7B",
        text: "How do you plan to fund your business?",
        options: [
            { id: "INVESTORS", text: "Investors (Angel/VC)", impacts: [{ entity: "Private Limited Company", score: 50 }] }, // Hard preference
            { id: "MAYBE_LATER", text: "Maybe Investors Later", impacts: [{ entity: "Private Limited Company", score: 30 }] },
            { id: "BANK_LOAN", text: "Bank Loan", impacts: [{ entity: "LLP", score: 20 }, { entity: "Private Limited Company", score: 15 }, { entity: "Sole Proprietorship", score: 15 }] },
            { id: "OWN_MONEY", text: "My Own Money (Bootstrap)", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "LLP", score: 15 }] },
            { id: "NOT_SURE", text: "Not Sure Yet", impacts: [{ entity: "Private Limited Company", score: 15 }, { entity: "LLP", score: 15 }] },
        ]
    },

    "Q8B": {
        id: "Q8B",
        text: "How much do you expect to earn in 2-3 years (Yearly Income)?",
        options: [
            { id: "UNDER_20L", text: "Less than ₹20 Lakhs", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 15 }] },
            { id: "20L_1CR", text: "₹20 Lakhs - ₹1 Crore", impacts: [{ entity: "LLP", score: 25 }, { entity: "OPC", score: 20 }, { entity: "Private Limited Company", score: 15 }] },
            { id: "1CR_5CR", text: "₹1 Crore - ₹5 Crores", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 20 }] },
            { id: "ABOVE_5CR", text: "More than ₹5 Crores", impacts: [{ entity: "Private Limited Company", score: 30 }] },
        ]
    },

    "Q9B": {
        id: "Q9B",
        text: "What type of business are you starting?",
        options: [
            { id: "TECH", text: "Software / Tech / App / SaaS", impacts: [{ entity: "Private Limited Company", score: 25 }] },
            { id: "PROFESSIONAL", text: "Professional Services (CA, Lawyer, Doctor)", impacts: [{ entity: "LLP", score: 35 }] },
            { id: "ONLINE_SELLING", text: "Online Selling (E-commerce)", impacts: [{ entity: "Private Limited Company", score: 25 }] },
            { id: "MANUFACTURING", text: "Manufacturing", impacts: [{ entity: "Private Limited Company", score: 25 }] },
            { id: "TRADING", text: "Trading / Import-Export", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }] },
            { id: "FINTECH", text: "Fintech / Lending (NBFC)", impacts: [{ entity: "Private Limited Company", score: 50 }], isHardGate: true, hardGateEntity: "Private Limited Company" },
            { id: "EDUCATION", text: "Education (School/College)", impacts: [], isHardGate: true, hardGateEntity: "Section 8 Company" }, // Actually likely Society/Trust, handling as hard gate
            { id: "FOOD", text: "Restaurant / Food", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }] },
            { id: "OTHER", text: "Other Services", impacts: [{ entity: "Sole Proprietorship", score: 15 }, { entity: "LLP", score: 15 }] },
        ]
    },

    "Q10B": {
        id: "Q10B",
        text: "Will you have foreign clients or receive money from abroad?",
        options: [
            { id: "FOREIGN_INVESTORS", text: "Yes, Foreign Investors", impacts: [{ entity: "Private Limited Company", score: 45 }] },
            { id: "FOREIGN_CLIENTS", text: "Yes, Foreign Clients (Service)", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 20 }] },
            { id: "MAYBE_FUTURE", text: "Maybe in Future", impacts: [{ entity: "Private Limited Company", score: 20 }] },
            { id: "INDIA_ONLY", text: "No, India Only", impacts: [] }, // No impact
        ]
    },

    "Q11B": {
        id: "Q11B",
        text: "Do you plan to open more branches or give franchise?",
        options: [
            { id: "FRANCHISE", text: "Yes, Franchise Model", impacts: [{ entity: "Private Limited Company", score: 30 }] },
            { id: "MULTIPLE_BRANCHES", text: "Yes, Multiple Branches", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 15 }] },
            { id: "ONE_LOCATION", text: "No, One Location", impacts: [{ entity: "Sole Proprietorship", score: 10 }, { entity: "LLP", score: 10 }] },
            { id: "ONLINE_ONLY", text: "Fully Online", impacts: [{ entity: "Private Limited Company", score: 15 }, { entity: "LLP", score: 15 }, { entity: "OPC", score: 15 }] },
        ]
    },

    "Q12B": {
        id: "Q12B",
        text: "Do you plan to sell this business someday or pass it to someone else?",
        options: [
            { id: "SELL", text: "Yes, Want to Sell", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 15 }] },
            { id: "FAMILY", text: "Pass to Family", impacts: [{ entity: "Private Limited Company", score: 20 }, { entity: "LLP", score: 15 }] },
            { id: "NOT_SURE", text: "Not Sure", impacts: [{ entity: "Private Limited Company", score: 15 }] },
            { id: "PERSONAL", text: "No, It's Personal", impacts: [{ entity: "Sole Proprietorship", score: 20 }] }
        ]
    }
};
