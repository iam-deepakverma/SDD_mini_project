import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, academicSummary } = useAuth();
  const [selectedCourses, setSelectedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(`emedley_cart_${user?._id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Re-load cart when active user changes
  useEffect(() => {
    if (user?._id) {
      try {
        const saved = localStorage.getItem(`emedley_cart_${user._id}`);
        setSelectedCourses(saved ? JSON.parse(saved) : []);
      } catch (_) {
        setSelectedCourses([]);
      }
    } else {
      setSelectedCourses([]);
    }
  }, [user?._id]);

  // Persist cart
  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`emedley_cart_${user._id}`, JSON.stringify(selectedCourses));
    }
  }, [selectedCourses, user?._id]);

  const totalCartCredits = selectedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const registeredCredits = academicSummary?.registeredCredits || 0;
  const maxCredits = academicSummary?.maxCredits || 18;
  const projectedTotalCredits = registeredCredits + totalCartCredits;

  const isInCart = (courseId) => {
    return selectedCourses.some((c) => c._id === courseId);
  };

  const addToCart = (course) => {
    if (isInCart(course._id)) {
      toast.error(`${course.courseCode} is already in your selection cart.`);
      return false;
    }

    const newProjectedCredits = registeredCredits + totalCartCredits + course.credits;
    if (newProjectedCredits > maxCredits) {
      toast.error(
        `Adding ${course.courseCode} (${course.credits} cr) would exceed max semester limit (${maxCredits} cr). Current total would be ${newProjectedCredits} cr.`
      );
      return false;
    }

    setSelectedCourses((prev) => [...prev, course]);
    toast.success(`Added ${course.courseCode} (${course.credits} Credits) to your cart.`);
    return true;
  };

  const removeFromCart = (courseId) => {
    setSelectedCourses((prev) => prev.filter((c) => c._id !== courseId));
    toast.success('Course removed from cart.');
  };

  const clearCart = () => {
    setSelectedCourses([]);
  };

  return (
    <CartContext.Provider
      value={{
        selectedCourses,
        totalCartCredits,
        projectedTotalCredits,
        maxCredits,
        registeredCredits,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
