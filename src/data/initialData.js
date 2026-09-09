export const initialData = {
  userProfile: {
    name: "Maya Lin",
    age: 28,
    biologicalSex: "Female",
    bloodGroup: "A-Positive",
    knownAllergies: [
      "Nickel (contact dermatitis)",
      "Ragweed pollen (seasonal allergic rhinitis)",
      "Fragrance mix I"
    ],
    chronicConditions: [
      "Atopic diathesis",
      "Mild episodic contact dermatitis"
    ]
  },
  dashboardMetrics: {
    recentScanStatus: "Mild / Low Risk",
    medicationAdherence: 88,
    checkInStreakDays: 12,
    sevenDayTrends: [
      {
        date: "2026-09-03",
        symptomSeverity: 3,
        moodScore: 7,
        stressLevel: "Low"
      },
      {
        date: "2026-09-04",
        symptomSeverity: 4,
        moodScore: 6,
        stressLevel: "Med"
      },
      {
        date: "2026-09-05",
        symptomSeverity: 6,
        moodScore: 5,
        stressLevel: "High"
      },
      {
        date: "2026-09-06",
        symptomSeverity: 5,
        moodScore: 6,
        stressLevel: "High"
      },
      {
        date: "2026-09-07",
        symptomSeverity: 4,
        moodScore: 7,
        stressLevel: "Med"
      },
      {
        date: "2026-09-08",
        symptomSeverity: 3,
        moodScore: 8,
        stressLevel: "Low"
      },
      {
        date: "2026-09-09",
        symptomSeverity: 2,
        moodScore: 8,
        stressLevel: "Low"
      }
    ]
  },
  activeMedications: [
    {
      id: "med_1",
      name: "Hydrocortisone 1% Topical Cream",
      dosage: "Thin film application",
      frequency: "Twice daily",
      timing: "Morning and Night",
      remainingDays: 3,
      adherenceStatus: "On Track"
    },
    {
      id: "med_2",
      name: "Cetirizine HCl",
      dosage: "10 mg tablet",
      frequency: "Once daily",
      timing: "Bedtime",
      remainingDays: 18,
      adherenceStatus: "On Track"
    },
    {
      id: "med_3",
      name: "Ceramide-Dominant Barrier Cream",
      dosage: "Liberal topical application",
      frequency: "Three times daily / PRN",
      timing: "Post-wash and as needed",
      remainingDays: 25,
      adherenceStatus: "Missed Dose Yesterday"
    }
  ],
  diagnosticScanHistory: [
    {
      id: "scn_20260828_01",
      timestamp: "2026-08-28T18:42:10Z",
      inputSymptoms: {
        textDescription: "Pruritic, well-demarcated erythema with fine scaling along the left ventral wrist directly beneath smartwatch chassis.",
        duration: "48 hours",
        visualSymptomType: "Erythematous scaly plaque"
      },
      aiAssessment: {
        primaryCondition: "Allergic Contact Dermatitis (Nickel sensitivity suspected)",
        confidenceScore: 0.91,
        differentialDiagnosis: [
          { condition: "Allergic Contact Dermatitis", probability: 0.91 },
          { condition: "Irritant Contact Dermatitis", probability: 0.06 },
          { condition: "Nummular Eczema", probability: 0.03 }
        ],
        severityScore: 4,
        triageLevel: "Home Care",
        recommendedNextSteps: [
          "Discontinue wear of the metal-backed smartwatch immediately",
          "Initiate barrier-repair emollient twice daily",
          "Monitor for vesicular weeping or secondary bacterial infection"
        ],
        otcRemedies: [
          "Hydrocortisone 1% cream BID for max 7 days",
          "Colloidal oatmeal soothing compresses"
        ]
      }
    },
    {
      id: "scn_20260905_02",
      timestamp: "2026-09-05T08:15:33Z",
      inputSymptoms: {
        textDescription: "Mild flare of lichenified xerotic patches on bilateral antecubital fossae; heightened pruritus following work deadline.",
        duration: "24 hours",
        visualSymptomType: "Flexural erythema and excoriation"
      },
      aiAssessment: {
        primaryCondition: "Atopic Dermatitis (Stress-induced flare)",
        confidenceScore: 0.88,
        differentialDiagnosis: [
          { condition: "Atopic Dermatitis", probability: 0.88 },
          { condition: "Lichen Simplex Chronicus", probability: 0.08 },
          { condition: "Tinea Corporis", probability: 0.04 }
        ],
        severityScore: 6,
        triageLevel: "Home Care",
        recommendedNextSteps: [
          "Re-apply bland ceramide moisturizer within 3 minutes of lukewarm bathing",
          "Resume short-course low-potency topical corticosteroid",
          "Practice night-time habit-reversal techniques to limit unconscious scratching"
        ],
        otcRemedies: [
          "Cetirizine 10mg PO nightly for allergic pruritus",
          "Hydrocortisone 1% ointment BID to flexural areas"
        ]
      }
    },
    {
      id: "scn_20260909_03",
      timestamp: "2026-09-09T09:30:00Z",
      inputSymptoms: {
        textDescription: "Resolving erythema on left wrist and inner elbows; minimal flaking, no excoriations or oozing noted.",
        duration: "7 days resolving",
        visualSymptomType: "Post-inflammatory faint macules"
      },
      aiAssessment: {
        primaryCondition: "Resolving Eczematous Dermatitis",
        confidenceScore: 0.94,
        differentialDiagnosis: [
          { condition: "Resolving Eczematous Dermatitis", probability: 0.94 },
          { condition: "Post-inflammatory Erythema", probability: 0.05 },
          { condition: "Mild Xerosis Cutis", probability: 0.01 }
        ],
        severityScore: 2,
        triageLevel: "Home Care",
        recommendedNextSteps: [
          "Taper Hydrocortisone 1% as lesions clear to prevent tachyphylaxis",
          "Maintain daily application of fragrance-free barrier creams",
          "Check pollen forecast before prolonged outdoor activity"
        ],
        otcRemedies: [
          "Ceramide and petrolatum-based emollients",
          "Continue oral Cetirizine 10mg as needed for ambient ragweed exposure"
        ]
      }
    }
  ],
  aiCoachChatHistory: {
    messages: [
      {
        id: "msg_1",
        sender: "ai",
        timestamp: "2026-09-08T19:00:15Z",
        content: "Good evening Maya. I noticed your logged mood rebounded to an 8/10 yesterday as your reported stress leveled out. How are your inner arms feeling after today's applications?"
      },
      {
        id: "msg_2",
        sender: "user",
        timestamp: "2026-09-08T19:04:22Z",
        content: "Much better! The itching has mostly stopped. The redness on my wrist from my watch is practically gone too."
      },
      {
        id: "msg_3",
        sender: "ai",
        timestamp: "2026-09-08T19:05:40Z",
        content: "That aligns well with this morning's scan showing significant re-epithelialization! Since your Hydrocortisone 1% course has 3 days remaining, consider stepping down to just your ceramide barrier cream once the skin is fully calm to prevent steroid thinning."
      },
      {
        id: "msg_4",
        sender: "user",
        timestamp: "2026-09-08T19:07:05Z",
        content: "Sounds good. Should I keep taking the Cetirizine even if the itching is gone?"
      },
      {
        id: "msg_5",
        sender: "ai",
        timestamp: "2026-09-08T19:08:18Z",
        content: "Keep it on hand. Ragweed pollen is peaking locally over the next 48 hours, so staying consistent with your nightly 10mg Cetirizine will help block the histamine response before it reactivates that itch-scratch cycle."
      }
    ],
    suggestedQuickReplies: [
      "Log tonight's medication",
      "Check local ragweed index",
      "Set reminder to taper hydrocortisone"
    ]
  },
  nearbyCareFacilities: [
    {
      id: "fac_1",
      name: "Beacon Hill Urgent Care & Walk-In",
      type: "Urgent Care",
      distanceMiles: 1.1,
      is24x7: false,
      phone: "+1-617-555-0144",
      address: "420 Cambridge St, Boston, MA 02114",
      estimatedWaitTimeMin: 18
    },
    {
      id: "fac_2",
      name: "Metro Dermatology & Allergy Specialists",
      type: "Dermatology Clinic",
      distanceMiles: 2.4,
      is24x7: false,
      phone: "+1-617-555-0198",
      address: "75 Blossom St, Suite 300, Boston, MA 02114",
      estimatedWaitTimeMin: 0
    },
    {
      id: "fac_3",
      name: "Massachusetts General Hospital Emergency Dept",
      type: "General Hospital",
      distanceMiles: 1.7,
      is24x7: true,
      phone: "+1-617-555-0100",
      address: "55 Fruit St, Boston, MA 02114",
      estimatedWaitTimeMin: 65
    }
  ]
};
