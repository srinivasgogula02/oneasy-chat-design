import { Question, Option } from "./types";

export const QUESTIONS: Record<string, Question> = {
    "Q1": {
        id: "Q1",
        text: "Are you starting a standard business for profit, or a non-profit organization (Charity/NGO)?",
        options: [
            {
                id: "BUSINESS",
                text: "Business for Profit",
                impacts: [
                    { entity: "Private Limited Company", score: 10 },
                    { entity: "LLP", score: 10 },
                    { entity: "Sole Proprietorship", score: 10 },
                    { entity: "OPC", score: 5 },
                ],
                nextQuestionId: "Q2B"
            },
            {
                id: "CHARITY",
                text: "Non-Profit / Charity / NGO",
                impacts: [
                    { entity: "Trust", score: 15 },
                    { entity: "Society", score: 15 },
                    { entity: "Section 8 Company", score: 15 },
                ],
                nextQuestionId: "Q2C"
            }
        ]
    },

    // =====================================================
    // BUSINESS PATH (Q2B - Q12B)
    // =====================================================

    "Q2B": {
        id: "Q2B",
        text: "Which of the following best describes your work?",
        options: [
            { id: "FREELANCER", text: "Freelancer (Writing, coding, design, consulting)", impacts: [{ entity: "Sole Proprietorship", score: 35 }], nextQuestionId: "Q3B" },
            { id: "CONTENT_CREATOR", text: "Content Creator (YouTuber, Influencer)", impacts: [{ entity: "Sole Proprietorship", score: 35 }], nextQuestionId: "Q3B" },
            { id: "SOLO_SERVICE", text: "Solo Service (Tutor, trainer, etc.)", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 10 }], nextQuestionId: "Q3B" },
            { id: "TRADING", text: "Trading/Reselling Goods", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }], nextQuestionId: "Q3B" },
            { id: "BUILDING_COMPANY", text: "Building a Company (Team, brand, growth)", impacts: [{ entity: "Private Limited Company", score: 35 }, { entity: "LLP", score: 20 }], nextQuestionId: "Q3B" },
        ]
    },

    "Q3B": {
        id: "Q3B",
        text: "What stage is your business currently at?",
        options: [
            { id: "IDEA", text: "Just an Idea", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 15 }], nextQuestionId: "Q4B" },
            { id: "TESTING", text: "Testing the Market", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "OPC", score: 20 }], nextQuestionId: "Q4B" },
            { id: "EARNING", text: "Earning Some Money", impacts: [{ entity: "LLP", score: 25 }, { entity: "Private Limited Company", score: 25 }, { entity: "OPC", score: 15 }], nextQuestionId: "Q4B" },
            { id: "RUNNING_WELL", text: "Running Well & Growing", impacts: [{ entity: "Private Limited Company", score: 30 }, { entity: "LLP", score: 20 }], nextQuestionId: "Q4B" },
        ]
    },

    "Q4B": {
        id: "Q4B",
        text: "How soon do you want to start your business?",
        options: [
            { id: "URGENT", text: "Today or Tomorrow (Urgent)", impacts: [{ entity: "Sole Proprietorship", score: 40 }], nextQuestionId: "Q5B" },
            { id: "THIS_WEEK", text: "This Week", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Partnership Firm", score: 15 }], nextQuestionId: "Q5B" },
            { id: "FEW_WEEKS", text: "2-3 Weeks is Okay", impacts: [{ entity: "Private Limited Company", score: 10 }, { entity: "LLP", score: 10 }], nextQuestionId: "Q5B" },
            { id: "NO_RUSH", text: "No Rush (Planning ahead)", impacts: [{ entity: "Private Limited Company", score: 15 }], nextQuestionId: "Q5B" },
        ]
    },

    "Q5B": {
        id: "Q5B",
        text: "How many people will own/run this business?",
        options: [
            { id: "JUST_ME", text: "Just Me (Solo)", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 30 }], nextQuestionId: "Q5B_NRI_SOLO" },
            { id: "TWO_PEOPLE", text: "Me and One Partner", impacts: [{ entity: "LLP", score: 30 }, { entity: "Private Limited Company", score: 30 }, { entity: "Partnership Firm", score: 30 }, { entity: "Public Limited Company", score: 30 }, { entity: "Sole Proprietorship", score: -1000 }, { entity: "OPC", score: -1000 }], nextQuestionId: "Q5B_NRI_MULTI" },
            { id: "SMALL_TEAM", text: "Small Team (3-5 people)", impacts: [{ entity: "Private Limited Company", score: 30 }, { entity: "LLP", score: 30 }, { entity: "Partnership Firm", score: 30 }, { entity: "Public Limited Company", score: 30 }, { entity: "Sole Proprietorship", score: -1000 }, { entity: "OPC", score: -1000 }], nextQuestionId: "Q5B_NRI_MULTI" },
            { id: "LARGE_GROUP", text: "Larger Group (6+ people)", impacts: [{ entity: "Private Limited Company", score: 30 }, { entity: "Public Limited Company", score: 30 }, { entity: "LLP", score: 30 }, { entity: "Sole Proprietorship", score: -1000 }, { entity: "OPC", score: -1000 }], nextQuestionId: "Q5B_NRI_MULTI" },
        ]
    },

    // NRI question for solo founders
    "Q5B_NRI_SOLO": {
        id: "Q5B_NRI_SOLO",
        text: "Are you a Non-Resident Indian (NRI) or foreign citizen?",
        options: [
            { id: "YES_NRI", text: "Yes, I am an NRI / Foreign Citizen", impacts: [{ entity: "Sole Proprietorship", score: -1000 }, { entity: "OPC", score: 10 }, { entity: "Private Limited Company", score: 30 }, { entity: "LLP", score: 30 }, { entity: "Public Limited Company", score: 30 }], nextQuestionId: "Q6B" },
            { id: "NO_RESIDENT", text: "No, I am an Indian resident", impacts: [], nextQuestionId: "Q6B" },
        ]
    },

    // NRI question for multiple founders/partners
    "Q5B_NRI_MULTI": {
        id: "Q5B_NRI_MULTI",
        text: "Are you or any of your partners Non-Resident Indians (NRI) or foreign citizens?",
        options: [
            { id: "YES_NRI", text: "Yes, one or more of us is NRI / Foreign Citizen", impacts: [{ entity: "Sole Proprietorship", score: -1000 }, { entity: "OPC", score: 10 }, { entity: "Private Limited Company", score: 30 }, { entity: "LLP", score: 30 }, { entity: "Public Limited Company", score: 30 }], nextQuestionId: "Q6B" },
            { id: "NO_RESIDENT", text: "No, we are all Indian residents", impacts: [], nextQuestionId: "Q6B" },
        ]
    },

    "Q6B": {
        id: "Q6B",
        text: "Do you want your personal assets (home, savings) protected from business risks?",
        options: [
            { id: "MUST_PROTECT", text: "Yes, Must be Protected", impacts: [{ entity: "Private Limited Company", score: 35 }, { entity: "LLP", score: 30 }, { entity: "OPC", score: 25 }], nextQuestionId: "Q7B" },
            { id: "NOT_WORRIED", text: "Not Worried / Low Risk", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "Partnership Firm", score: 20 }], nextQuestionId: "Q7B" },
            { id: "NOT_SURE", text: "Not Sure", impacts: [{ entity: "Private Limited Company", score: 20 }, { entity: "LLP", score: 20 }], nextQuestionId: "Q7B" },
        ]
    },

    "Q7B": {
        id: "Q7B",
        text: "How do you plan to fund your business?",
        options: [
            { id: "INVESTORS", text: "Investors (Angel/VC)", impacts: [{ entity: "Private Limited Company", score: 50 }], nextQuestionId: "Q8B" },
            { id: "MAYBE_LATER", text: "Maybe Investors Later", impacts: [{ entity: "Private Limited Company", score: 30 }], nextQuestionId: "Q8B" },
            { id: "BANK_LOAN", text: "Bank Loan", impacts: [{ entity: "LLP", score: 20 }, { entity: "Private Limited Company", score: 15 }, { entity: "Sole Proprietorship", score: 15 }], nextQuestionId: "Q8B" },
            { id: "OWN_MONEY", text: "My Own Money (Bootstrap)", impacts: [{ entity: "Sole Proprietorship", score: 25 }, { entity: "LLP", score: 15 }], nextQuestionId: "Q8B" },
            { id: "NOT_SURE_FUND", text: "Not Sure Yet", impacts: [{ entity: "Private Limited Company", score: 15 }, { entity: "LLP", score: 15 }], nextQuestionId: "Q8B" },
        ]
    },

    "Q8B": {
        id: "Q8B",
        text: "How much do you expect to earn in 2-3 years (Yearly Income)?",
        options: [
            { id: "UNDER_20L", text: "Less than ₹20 Lakhs", impacts: [{ entity: "Sole Proprietorship", score: 30 }, { entity: "OPC", score: 15 }], nextQuestionId: "Q9B" },
            { id: "20L_1CR", text: "₹20 Lakhs - ₹1 Crore", impacts: [{ entity: "LLP", score: 25 }, { entity: "OPC", score: 20 }, { entity: "Private Limited Company", score: 15 }], nextQuestionId: "Q9B" },
            { id: "1CR_5CR", text: "₹1 Crore - ₹5 Crores", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 20 }], nextQuestionId: "Q9B" },
            { id: "ABOVE_5CR", text: "More than ₹5 Crores", impacts: [{ entity: "Private Limited Company", score: 30 }], nextQuestionId: "Q9B" },
        ]
    },

    "Q9B": {
        id: "Q9B",
        text: "What type of business are you starting?",
        options: [
            { id: "TECH", text: "Software / Tech / App / SaaS", impacts: [{ entity: "Private Limited Company", score: 25 }], nextQuestionId: "Q10B" },
            { id: "PROFESSIONAL", text: "Professional Services (CA, Lawyer, Doctor)", impacts: [{ entity: "LLP", score: 35 }], nextQuestionId: "Q10B" },
            { id: "ONLINE_SELLING", text: "Online Selling (E-commerce)", impacts: [{ entity: "Private Limited Company", score: 25 }], nextQuestionId: "Q10B" },
            { id: "MANUFACTURING", text: "Manufacturing", impacts: [{ entity: "Private Limited Company", score: 25 }], nextQuestionId: "Q10B" },
            { id: "TRADING_BIZ", text: "Trading / Import-Export", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }], nextQuestionId: "Q10B" },
            { id: "FINTECH", text: "Fintech / Lending (NBFC)", impacts: [{ entity: "Private Limited Company", score: 50 }], isHardGate: true, hardGateEntity: "Private Limited Company", nextQuestionId: "COMPLETE" },
            { id: "FOOD", text: "Restaurant / Food", impacts: [{ entity: "Sole Proprietorship", score: 20 }, { entity: "Private Limited Company", score: 15 }], nextQuestionId: "Q10B" },
            { id: "OTHER_BIZ", text: "Other Services", impacts: [{ entity: "Sole Proprietorship", score: 15 }, { entity: "LLP", score: 15 }], nextQuestionId: "Q10B" },
        ]
    },

    "Q10B": {
        id: "Q10B",
        text: "Will you have foreign clients or receive money from abroad?",
        options: [
            { id: "FOREIGN_INVESTORS", text: "Yes, Foreign Investors", impacts: [{ entity: "Private Limited Company", score: 45 }], nextQuestionId: "Q11B" },
            { id: "FOREIGN_CLIENTS", text: "Yes, Foreign Clients (Service)", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 20 }], nextQuestionId: "Q11B" },
            { id: "MAYBE_FUTURE", text: "Maybe in Future", impacts: [{ entity: "Private Limited Company", score: 20 }], nextQuestionId: "Q11B" },
            { id: "INDIA_ONLY", text: "No, India Only", impacts: [], nextQuestionId: "Q11B" },
        ]
    },

    "Q11B": {
        id: "Q11B",
        text: "Do you plan to open more branches or give franchise?",
        options: [
            { id: "FRANCHISE", text: "Yes, Franchise Model", impacts: [{ entity: "Private Limited Company", score: 30 }], nextQuestionId: "Q12B" },
            { id: "MULTIPLE_BRANCHES", text: "Yes, Multiple Branches", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 15 }], nextQuestionId: "Q12B" },
            { id: "ONE_LOCATION", text: "No, One Location", impacts: [{ entity: "Sole Proprietorship", score: 10 }, { entity: "LLP", score: 10 }], nextQuestionId: "Q12B" },
            { id: "ONLINE_ONLY", text: "Fully Online", impacts: [{ entity: "Private Limited Company", score: 15 }, { entity: "LLP", score: 15 }, { entity: "OPC", score: 15 }], nextQuestionId: "Q12B" },
        ]
    },

    "Q12B": {
        id: "Q12B",
        text: "Do you plan to sell this business someday or pass it to someone else?",
        options: [
            { id: "SELL", text: "Yes, Want to Sell", impacts: [{ entity: "Private Limited Company", score: 25 }, { entity: "LLP", score: 15 }], nextQuestionId: "COMPLETE" },
            { id: "FAMILY", text: "Pass to Family", impacts: [{ entity: "Private Limited Company", score: 20 }, { entity: "LLP", score: 15 }], nextQuestionId: "COMPLETE" },
            { id: "NOT_SURE_EXIT", text: "Not Sure", impacts: [{ entity: "Private Limited Company", score: 15 }], nextQuestionId: "COMPLETE" },
            { id: "PERSONAL", text: "No, It's Personal", impacts: [{ entity: "Sole Proprietorship", score: 20 }], nextQuestionId: "COMPLETE" }
        ]
    },

    // =====================================================
    // CHARITY / NON-PROFIT PATH (Q2C - Q6C)
    // =====================================================

    "Q2C": {
        id: "Q2C",
        text: "What is the main purpose of your non-profit organization?",
        options: [
            { id: "CHARITABLE", text: "Charitable work (helping poor, healthcare, disaster relief)", impacts: [{ entity: "Trust", score: 30 }, { entity: "Section 8 Company", score: 25 }], nextQuestionId: "Q3C" },
            { id: "EDUCATIONAL", text: "Education (school, college, scholarships)", impacts: [{ entity: "Society", score: 30 }, { entity: "Section 8 Company", score: 25 }, { entity: "Trust", score: 20 }], nextQuestionId: "Q3C" },
            { id: "RELIGIOUS", text: "Religious activities (temple, mosque, church)", impacts: [{ entity: "Trust", score: 40 }], nextQuestionId: "Q3C" },
            { id: "CULTURAL", text: "Cultural / Arts / Sports promotion", impacts: [{ entity: "Society", score: 35 }, { entity: "Section 8 Company", score: 20 }], nextQuestionId: "Q3C" },
            { id: "SOCIAL_WELFARE", text: "Social welfare / Community development", impacts: [{ entity: "Society", score: 30 }, { entity: "Trust", score: 25 }, { entity: "Section 8 Company", score: 20 }], nextQuestionId: "Q3C" },
            { id: "RESEARCH", text: "Research / Science / Innovation", impacts: [{ entity: "Section 8 Company", score: 35 }, { entity: "Society", score: 20 }], nextQuestionId: "Q3C" },
        ]
    },

    "Q3C": {
        id: "Q3C",
        text: "How many people are founding this organization?",
        options: [
            { id: "TWO_FOUNDERS", text: "2-3 people", impacts: [{ entity: "Trust", score: 35 }, { entity: "Section 8 Company", score: 25 }], nextQuestionId: "Q4C" },
            { id: "FOUR_TO_SIX", text: "4-6 people", impacts: [{ entity: "Trust", score: 25 }, { entity: "Society", score: 25 }, { entity: "Section 8 Company", score: 30 }], nextQuestionId: "Q4C" },
            { id: "SEVEN_PLUS", text: "7 or more people", impacts: [{ entity: "Society", score: 40 }], nextQuestionId: "Q4C" }, // Society requires minimum 7 members
        ]
    },

    "Q4C": {
        id: "Q4C",
        text: "Do you want to apply for government grants or foreign funding (FCRA)?",
        options: [
            { id: "GOVT_GRANTS", text: "Yes, Government grants", impacts: [{ entity: "Section 8 Company", score: 30 }, { entity: "Society", score: 25 }, { entity: "Trust", score: 20 }], nextQuestionId: "Q5C" },
            { id: "FOREIGN_FUNDING", text: "Yes, Foreign funding (FCRA)", impacts: [{ entity: "Section 8 Company", score: 35 }, { entity: "Trust", score: 25 }], nextQuestionId: "Q5C" },
            { id: "DONATIONS_ONLY", text: "Only local donations", impacts: [{ entity: "Trust", score: 30 }], nextQuestionId: "Q5C" },
            { id: "SELF_FUNDED", text: "Self-funded / Founder's money", impacts: [{ entity: "Trust", score: 35 }], nextQuestionId: "Q5C" },
        ]
    },

    "Q5C": {
        id: "Q5C",
        text: "How important is legal credibility and compliance to you?",
        options: [
            { id: "VERY_IMPORTANT", text: "Very important - need high credibility", impacts: [{ entity: "Section 8 Company", score: 40 }], nextQuestionId: "Q6C" },
            { id: "MODERATE", text: "Moderate - some compliance is okay", impacts: [{ entity: "Society", score: 25 }, { entity: "Trust", score: 25 }], nextQuestionId: "Q6C" },
            { id: "SIMPLE", text: "Want to keep it simple", impacts: [{ entity: "Trust", score: 35 }], nextQuestionId: "Q6C" },
        ]
    },

    "Q6C": {
        id: "Q6C",
        text: "Will this organization operate in one state or across India?",
        options: [
            { id: "ONE_STATE", text: "One state only", impacts: [{ entity: "Trust", score: 30 }, { entity: "Society", score: 25 }], nextQuestionId: "COMPLETE" },
            { id: "MULTIPLE_STATES", text: "Multiple states", impacts: [{ entity: "Section 8 Company", score: 35 }, { entity: "Society", score: 15 }], nextQuestionId: "COMPLETE" }, // Society may need re-registration
            { id: "PAN_INDIA", text: "Pan-India operations", impacts: [{ entity: "Section 8 Company", score: 40 }], nextQuestionId: "COMPLETE" },
        ]
    },
};

// Helper to get question safely
export function getQuestion(questionId: string): Question | null {
    return QUESTIONS[questionId] || null;
}
