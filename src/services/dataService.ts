import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Çalışan veri tipi
export interface Employee {
  id?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Mesai veri tipi
export interface Overtime {
  id?: string;
  employeeId: string;
  date: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// İzin veri tipi
export interface Leave {
  id?: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'personal' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Çalışan işlemleri
export const employeeService = {
  // Tüm çalışanları getir
  async getAll(userId: string): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, 'employees'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  },

  // Çalışan ekle
  async add(employee: Omit<Employee, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employee,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding employee:', error);
      return null;
    }
  },

  // Çalışan güncelle
  async update(id: string, employee: Partial<Employee>): Promise<boolean> {
    try {
      const docRef = doc(db, 'employees', id);
      await updateDoc(docRef, {
        ...employee,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  },

  // Çalışan sil
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'employees', id));
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }
};

// Mesai işlemleri
export const overtimeService = {
  // Tüm mesaileri getir
  async getAll(userId: string): Promise<Overtime[]> {
    try {
      const q = query(
        collection(db, 'overtimes'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Overtime[];
    } catch (error) {
      console.error('Error getting overtimes:', error);
      return [];
    }
  },

  // Mesai ekle
  async add(overtime: Omit<Overtime, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'overtimes'), {
        ...overtime,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding overtime:', error);
      return null;
    }
  },

  // Mesai güncelle
  async update(id: string, overtime: Partial<Overtime>): Promise<boolean> {
    try {
      const docRef = doc(db, 'overtimes', id);
      await updateDoc(docRef, {
        ...overtime,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating overtime:', error);
      return false;
    }
  },

  // Mesai sil
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'overtimes', id));
      console.log('✅ Overtime deleted from Firebase:', id);
      return true;
    } catch (error) {
      console.error('Error deleting overtime:', error);
      return false;
    }
  }
};

// İzin işlemleri
export const leaveService = {
  // Tüm izinleri getir
  async getAll(userId: string): Promise<Leave[]> {
    try {
      const q = query(
        collection(db, 'leaves'),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Leave[];
    } catch (error) {
      console.error('Error getting leaves:', error);
      return [];
    }
  },

  // İzin ekle
  async add(leave: Omit<Leave, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'leaves'), {
        ...leave,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave:', error);
      return null;
    }
  },

  // İzin güncelle
  async update(id: string, leave: Partial<Leave>): Promise<boolean> {
    try {
      const docRef = doc(db, 'leaves', id);
      await updateDoc(docRef, {
        ...leave,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating leave:', error);
      return false;
    }
  },

  // İzin sil
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'leaves', id));
      console.log('✅ Leave deleted from Firebase:', id);
      return true;
    } catch (error) {
      console.error('Error deleting leave:', error);
      return false;
    }
  }
};

// Maaş veri tipi
export interface Salary {
  id?: string;
  userId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  bonus: number;
  besDeduction: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Maaş işlemleri
export const salaryService = {
  // Tüm maaşları getir
  async getAll(userId: string): Promise<Salary[]> {
    try {
      const q = query(
        collection(db, 'salaries'),
        where('userId', '==', userId),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Salary[];
    } catch (error) {
      console.error('Error getting salaries:', error);
      return [];
    }
  },

  // Maaş ekle
  async add(salary: Omit<Salary, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'salaries'), {
        ...salary,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding salary:', error);
      return null;
    }
  },

  // Maaş güncelle
  async update(id: string, salary: Partial<Salary>): Promise<boolean> {
    try {
      const docRef = doc(db, 'salaries', id);
      await updateDoc(docRef, {
        ...salary,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating salary:', error);
      return false;
    }
  },

  // Maaş sil
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'salaries', id));
      return true;
    } catch (error) {
      console.error('Error deleting salary:', error);
      return false;
    }
  }
}; 