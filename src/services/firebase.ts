import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
  sendEmailVerification,
} from 'firebase/auth';

import {
  appleProvider,
  facebookProvider,
  firebaseAuth,
  firestore,
  googleProvider,
} from '../../firebaseConfig';
import { FirebaseError } from 'firebase/app';
import { ReportFormData, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { query, where, limit } from 'firebase/firestore';

export async function fetchUserData(uid: string) {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      throw new Error('User record not found in Firestore');
    }

    const userData = userSnapshot.data() as User;
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Optionally, you can resend the verification email here
      // await sendEmailVerification(userCredential.user);
      return {
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
      };
    }

    const uid = userCredential.user.uid;
    const userDocRef = doc(firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      throw new Error('User record not found in Firestore');
    }

    const userData = userSnapshot.data();

    // If email is verified now, accept any pending invitation tied to this email
    if (userCredential.user.emailVerified && userCredential.user.email) {
      try {
        const invitationsRef = collection(firestore, 'invitations');
        const q = query(
          invitationsRef,
          where('reservedEmail', '==', userCredential.user.email),
          where('status', '==', 'verification_sent'),
          limit(1)
        );
        const inviteQuerySnap = await getDocs(q);
        if (!inviteQuerySnap.empty) {
          const inviteDoc = inviteQuerySnap.docs[0];
          await updateDoc(doc(firestore, 'invitations', inviteDoc.id), {
            status: 'accepted',
            acceptedBy: uid,
          });
        }
      } catch (e) {
        // Non-fatal; proceed with login
        console.error('Error updating invitation status on verified login', e);
      }
    }

    return {
      success: true,
      user: {
        id: uid,
        email: userCredential.user.email,
        role: userData.role,
        name: userData.name,
        firstSurname: userData.firstSurname,
        secondSurname: userData.secondSurname,
        birthday: userData.birthday,
      },
    };
  } catch (error) {
    console.error('Login failed:', error);
    return {
      success: false,
      error: (error as FirebaseError).message,
    };
  }
}

export const logout = async () => {
  await signOut(firebaseAuth);
};

export const signInWithGoogle = async () => {
  try {
    const result: UserCredential = await signInWithPopup(
      firebaseAuth,
      googleProvider
    );

    const user = result.user;
    const uid = user.uid;

    const userDocRef = doc(firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    let userData;
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, {
        role: 'User',
        email: user.email,
      });
      userData = {
        role: 'User',
        email: user.email,
      };
    } else {
      userData = userSnapshot.data();
    }

    return {
      success: true,
      user: {
        id: uid,
        email: user.email,
        role: userData?.role,
        name: userData.name,
        firstSurname: userData.firstSurname,
        secondSurname: userData.secondSurname,
        birthday: userData.birthday,
      },
    };
  } catch (err) {
    console.error('Google sign-in error', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};

export const createReport = async (
  formData: ReportFormData,
  userId: string
) => {
  try {
    const reportData = {
      ...formData,
      userId,
      createdAt: new Date(),
      reportStatus: 'New',
    };

    const docRef = await addDoc(collection(firestore, 'reports'), reportData);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Report creation failed:', error);
    return {
      success: false,
      error: (error as FirebaseError).message,
    };
  }
};

export const getAllRecords = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'reports'));
    const records = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return {
      success: true,
      records,
    };
  } catch (error) {
    console.error('Failed to get records:', error);
    return {
      success: false,
      error: (error as FirebaseError).message,
    };
  }
};

export const getUserRecords = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'reports'));
    const allRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // For now, show all reports since existing reports might not have userId
    // TODO: Add proper filtering once all reports have userId
    const records = allRecords.filter((record: any) => {
      // If record has userId, filter by it, otherwise show all (temporary)
      if (record.userId) {
        return record.userId === userId;
      } else {
        return true; // Show all reports without userId for now
      }
    });

    return {
      success: true,
      records,
    };
  } catch (error) {
    console.error('Failed to get user records:', error);
    return {
      success: false,
      error: (error as FirebaseError).message,
    };
  }
};

export const signInWithFacebook = async () => {
  try {
    const result: UserCredential = await signInWithPopup(
      firebaseAuth,
      facebookProvider
    );

    const user = result.user;
    const uid = user.uid;

    const userDocRef = doc(firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    let userData;
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, {
        role: 'User',
        email: user.email,
      });
      userData = {
        role: 'User',
        email: user.email,
      };
    } else {
      userData = userSnapshot.data();
    }

    return {
      success: true,
      user: {
        id: uid,
        email: user.email,
        role: userData?.role,
        name: userData.name,
        firstSurname: userData.firstSurname,
        secondSurname: userData.secondSurname,
        birthday: userData.birthday,
      },
    };
  } catch (err) {
    console.error('Google sign-in error', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};

export const signInWithApple = async () => {
  try {
    appleProvider.addScope('email');
    appleProvider.addScope('name');

    const result: UserCredential = await signInWithPopup(
      firebaseAuth,
      appleProvider
    );

    const user = result.user;
    const uid = user.uid;

    const userDocRef = doc(firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    let userData;
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, {
        role: 'User',
        email: user.email,
      });
      userData = {
        role: 'User',
        email: user.email,
      };
    } else {
      userData = userSnapshot.data();
    }

    return {
      success: true,
      user: {
        id: uid,
        email: user.email,
        role: userData?.role,
        name: userData.name,
        firstSurname: userData.firstSurname,
        secondSurname: userData.secondSurname,
        birthday: userData.birthday,
      },
    };
  } catch (err) {
    console.error('Apple sign-in error', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};

export const updateUserData = async (formData: Partial<User>) => {
  try {
    if (!formData.id) {
      throw new FirebaseError(
        'store/id-not-valid',
        'User ID is required to update user data.'
      );
    }

    const userRef = doc(firestore, 'users', formData.id);
    await updateDoc(userRef, {
      ...formData,
    });

    return {
      success: true,
    };
  } catch (err) {
    console.error('Error updating user data', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    // Send email verification
    await sendEmailVerification(userCredential.user);

    const uid = userCredential.user.uid;
    const internalUserId = uuidv4();

    await setDoc(doc(firestore, 'users', uid), {
      id: internalUserId,
      email,
      role: 'User',
      name: '',
      firstSurname: '',
      secondSurname: '',
      birthday: '',
    });

    return {
      success: true,
      user: {
        id: uid,
        email,
        internalId: internalUserId,
      },
    };
  } catch (error) {
    console.error('Sign-up failed:', error);
    return {
      success: false,
      error: (error as FirebaseError).message,
    };
  }
};

export const getAllUsers = async () => {
  try {
    const usersCollectionRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const users = usersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
    return {
      success: true,
      users,
    };
  } catch (err) {
    console.error('Error getting all users', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};

export const updateReportStatus = async (
  reportId: string,
  status: 'Pending' | 'New' | 'Closed'
) => {
  try {
    const reportRef = doc(firestore, 'reports', reportId);
    await updateDoc(reportRef, {
      reportStatus: status,
    });
    return {
      success: true,
    };
  } catch (err) {
    console.error('Error getting all users', err);
    return {
      success: false,
      error: (err as FirebaseError).message,
    };
  }
};

// Firebase invitation functions removed - now using API
