import { useProfanity } from "@/hooks/useProfanity";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { profanityFilter } from "./profanity";


{/* For calculating in-game score */}
export interface NSortScoreProps {
  stimuliTypes: number;
  sequenceLength: number;
  presentationSpeed: number;
  accuracy: number;
}

export function calculateNSortScore({
  stimuliTypes,
  sequenceLength,
  presentationSpeed,
  accuracy,
}: NSortScoreProps) {
  // Input validation
  if(
    stimuliTypes < 1 ||
    sequenceLength < 2 ||
    sequenceLength > 16 ||
    presentationSpeed < 0.25 ||
    presentationSpeed > 4 ||
    accuracy < 0 ||
    accuracy > 1
  ) {
    throw new Error('Invalid input parameters');
  }

  // Base difficulty components
 const baseDifficulty = calculateBaseDifficulty(
    stimuliTypes,
    sequenceLength,
    presentationSpeed
  );

  // Convert to IQ-like score (mean=100, std=15)
  const rawScore = baseDifficulty * accuracy;
  //const iqScore = convertToIQScale(rawScore);
  //let iqScore = 100 + 15 * (1.67 * Math.log(stimuliTypes) + 0.5 * (3 - sequenceLength) + 0.25 * Math.log(presentationSpeed) );
  {/* THIS IQ SCORE HAS BEEN BROKEN BY EVERYONE */}
  // const stimPerSecond = (stimuliTypes * sequenceLength) / presentationSpeed;
  //let iqScore = 100 + 20.5 * Math.log(stimPerSecond / 3) + 15.6 * Math.log(stimuliTypes) + 10.5 * Math.log(sequenceLength);
  {/* NEW IQ SCORE CALCULATOR */}
  let iqScore = 100 + 20.5 * Math.log((sequenceLength * stimuliTypes) / 3) + 15.6 * Math.log(stimuliTypes) + 20.5 * Math.log(sequenceLength) - 10 * Math.log(presentationSpeed);
  iqScore *= accuracy;
  

  return {
    score: Math.round(iqScore),
    baseDifficulty: Math.round(baseDifficulty),
    rawScore: Math.round(rawScore),
    breakdown: getDifficultyBreakdown(
      stimuliTypes,
      sequenceLength,
      presentationSpeed
    ),
  };
}

function calculateBaseDifficulty(
  stimuliTypes : number,
  sequenceLength : number,
  presentationSpeed : number
) {
  // Stimuli complexity (exponential growth - each new type is a major jump)
  const stimuliDifficulty = Math.pow(2, stimuliTypes - 1);

  // Sequence length difficulty (polynomial growth)
  const sequenceDifficulty = Math.pow(sequenceLength, 1.8);

  // Speed difficulty (inverse relationship with exponential scaling at extremes)
  const speedDifficulty = calculateSpeedDifficulty(presentationSpeed);

  // Combined difficulty (multiplicative because they interact)
  const combinedDifficulty =
    stimuliDifficulty * sequenceDifficulty * speedDifficulty;

  // Scale to reasonable base difficulty range (50-500)
  return 50 + combinedDifficulty * 2;
}

function calculateSpeedDifficulty(speed : number) {
  // Speed difficulty curve: manageable at 4s, exponentially harder as it approaches 0.25s
  if (speed >= 2.0) {
    // Easy range (4s to 2s): minimal difficulty increase
    return 1 + (4 - speed) * 0.2;
  } else if (speed >= 1.0) {
    // Moderate range (2s to 1s): noticeable increase
    return 1.4 + (2 - speed) * 0.8;
  } else if (speed >= 0.5) {
    // Hard range (1s to 0.5s): steep increase
    return 2.2 + (1 - speed) * 3;
  } else {
    // Insane range (0.5s to 0.25s): exponential increase
    return 3.7 + Math.pow((0.5 - speed) * 8, 2);
  }
}

function convertToIQScale(rawScore : number) {
  // Convert raw score to IQ-like distribution
  // Using a sigmoid-like transformation to create the IQ curve

  // Target: 3 stimuli, length 3, 3s speed = ~145 raw difficulty = 100 IQ
  const targetMean = 145;

  // Normalize around the target mean
  const normalized = (rawScore - targetMean) / targetMean;

  // Apply sigmoid transformation for IQ-like curve with steeper scaling
  // This creates the "harder to earn points as you go higher" effect
  const sigmoidValue = 2 / (1 + Math.exp(-normalized * 1.5)) - 1;

  // Scale to IQ range with higher ceiling (40-200+)
  const iqScore = 100 + sigmoidValue * 65;

  // Ensure minimum floor and allow for exceptional scores
  return Math.max(40, iqScore);
}

function getDifficultyBreakdown(
  stimuliTypes : number,
  sequenceLength : number,
  presentationSpeed : number
) {
  const stimuliDifficulty = Math.pow(2, stimuliTypes - 1);
  const sequenceDifficulty = Math.pow(sequenceLength, 1.8);
  const speedDifficulty = calculateSpeedDifficulty(presentationSpeed);

  return {
    stimuliContribution: Math.round(stimuliDifficulty * 10) / 10,
    sequenceContribution: Math.round(sequenceDifficulty * 10) / 10,
    speedContribution: Math.round(speedDifficulty * 10) / 10,
    speedCategory: getSpeedCategory(presentationSpeed),
  };
}

function getSpeedCategory(speed : number) {
  if (speed >= 2.0) return 'Comfortable';
  if (speed >= 1.0) return 'Moderate';
  if (speed >= 0.5) return 'Challenging';
  return 'Extreme';
}

{/* For leaderboard scores?? */}
export async function saveScore(username: string, score: number) {
  if (!username) throw new Error("Username is required");

  if(profanityFilter.isProfane(username)){
    return;
  }


  const scoreRef = doc(db, "scores", username); // username as doc ID
  const existingSnap = await getDoc(scoreRef);

  if (!existingSnap.exists()) {
    // No existing score, create new
    await setDoc(scoreRef, {
      username,
      score,
      createdAt: new Date().toISOString(),
    });
  } else {
    const existingData = existingSnap.data();
    if (score > existingData.score) {
      // Only update if the new score is higher
      await setDoc(
        scoreRef,
        {
          username,
          score,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }
}
