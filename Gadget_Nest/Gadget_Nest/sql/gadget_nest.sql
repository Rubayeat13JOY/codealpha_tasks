-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2026 at 06:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gadget_nest`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`) VALUES
(1, 'juwel123@gmail.com', 'juwel'),
(2, 'admin', '$2y$10$ZpUGrT0/Uh/4a4e6r7lJ9uQvK/9vYK1poaM.vjU2uQlC6DfQ1wZV6');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`) VALUES
(1, 'Starlink', 'images/icon1.png'),
(2, 'Drone', 'images/icon2.png'),
(3, 'Gimbal', 'images/icon3.png'),
(4, 'Table PC', 'images/icon4.png'),
(5, 'TV', 'images/icon5.png'),
(6, 'Mobile Phone', 'images/icon6.png'),
(7, 'Mobile Accessories', 'images/icon7.png'),
(8, 'Portable SSD', 'images/icon8.png'),
(9, 'WiFi Camera', 'images/icon9.png'),
(10, 'Trimmer', 'images/icon10.png'),
(11, 'Smart Watch', 'images/icon11.png'),
(12, 'Action Camera', 'images/icon12.png'),
(13, 'Earphone', 'images/icon13.png'),
(14, 'Earbuds', 'images/icon14.png'),
(15, 'Bluetooth Speakers', 'images/icon15.png'),
(16, 'Gaming Console', 'images/icon16.png'),
(17, 'Smart Glass', 'images/icon17.png'),
(18, 'VR Headset', 'images/icon18.png'),
(19, 'Power Bank', 'images/icon19.png'),
(20, 'Router', 'images/icon20.png'),
(21, 'Gaming Mouse', 'images/icon21.png'),
(22, 'Keyboard', 'images/icon22.png'),
(23, 'Camera Lens', 'images/icon23.png'),
(24, 'Monitor', 'images/icon24.png');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `discount_percent` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `old_price` decimal(10,2) NOT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `product_name`, `image`, `discount_percent`, `description`, `old_price`, `new_price`, `status`, `created_at`) VALUES
(1, 'Smart Watch Pro', 'images/top_1.png', 20, 'Get the Smart Watch Pro at a discounted price this month only!', 12990.00, 10392.00, 'active', '2025-12-23 17:32:33'),
(2, 'Smart Watch Pro', 'images/top_2.png', 20, 'Get the Smart Watch Pro at a discounted price this month only!', 12990.00, 10392.00, 'active', '2025-12-23 17:32:33'),
(3, 'Drone X3', 'images/slider_1.png', 15, 'Fly high with Drone X3 at a special price for a limited time.', 45000.00, 38250.00, 'active', '2025-12-23 17:32:33'),
(4, 'Gaming Console', 'images/slider_2.png', 10, 'Enjoy your favorite games with the latest console at discount.', 68000.00, 61200.00, 'active', '2025-12-23 17:32:33'),
(5, 'Bluetooth Speaker', 'images/slider_3.png', 25, 'Grab the best sound quality with Bluetooth Speaker now on offer.', 3490.00, 2618.00, 'active', '2025-12-23 17:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `payment_method` enum('Cash on Delivery','bKash','Nagad','Card Payment') DEFAULT 'Cash on Delivery',
  `transaction_id` varchar(100) DEFAULT NULL,
  `card_number` varchar(20) DEFAULT NULL,
  `card_expiry` varchar(10) DEFAULT NULL,
  `card_cvv` varchar(10) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `shipping` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` enum('Pending','Confirmed','Shipped','Delivered') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `trx_id` varchar(255) DEFAULT NULL,
  `card_exp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `payment_method`, `transaction_id`, `card_number`, `card_expiry`, `card_cvv`, `subtotal`, `shipping`, `tax`, `total`, `status`, `created_at`, `trx_id`, `card_exp`) VALUES
(31, 1, 'adf', 'adf', 'juwel@gmail.com', '1876261415', 'fdg', 'gfg', 'Cash on Delivery', '', '', '', '', 12990.00, 500.00, 324.75, 13814.75, 'Confirmed', '2025-12-31 16:33:36', NULL, NULL),
(32, 1, 'adf', 'adf', 'juwel123@gmail.com', '1876261415', 'sdfg', 'fdgfdsg', 'Nagad', 'sfdgsdfgdfsg', '', '', '', 9990.00, 500.00, 249.75, 10739.75, 'Pending', '2025-12-31 16:33:57', NULL, NULL),
(33, 1, 'sfdgbfdg', 'sdfgdsfgfg', 'juwel@gmail.com', 'dsfgdfs', 'gdsfgddfgsd', 'sfdgdfg', 'Card Payment', '', 'sfg', 'gsdfdg', 'sfdgfdg', 13890.00, 500.00, 347.25, 14737.25, 'Pending', '2025-12-31 16:34:40', NULL, NULL),
(34, 1, 'adf', 'adf', 'juwel@gmail.com', '01876261415', 'asdf', 'adsf', 'Cash on Delivery', '', '', '', '', 48469.99, 500.00, 1211.75, 50181.74, 'Pending', '2025-12-31 16:48:31', NULL, NULL),
(35, 1, 'fdsf', 'asdf', 'juwel@gmail.com', '01876261415', 'dasf', 'hiop', 'Cash on Delivery', '', '', '', '', 15990.00, 500.00, 399.75, 16889.75, 'Pending', '2025-12-31 16:56:47', NULL, NULL),
(36, 1, 'adf', 'adf', 'juwel@gmail.com', '01876261415', 'dfd', 'f', 'Nagad', '', '', '', '', 499.99, 500.00, 12.50, 1012.49, 'Pending', '2025-12-31 18:04:03', NULL, NULL),
(37, 1, 'asdf', 'adf', 'adf@gmial.com', '1876261415', 'asdf', 'adsf', 'Cash on Delivery', '', '', '', '', 900.00, 500.00, 22.50, 1422.50, 'Pending', '2026-01-01 12:04:50', NULL, NULL),
(38, 1, 'asdf', 'adf', 'adf@gmial.com', '1876261415', 'asdf', 'adsf', 'Cash on Delivery', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 'Pending', '2026-01-01 12:04:50', NULL, NULL),
(39, 1, 'dse', 'db', 'm@gmail.com', '1876261415', 'ghj', 'hj', 'Cash on Delivery', '', '', '', '', 129.99, 500.00, 3.25, 633.24, 'Pending', '2026-01-01 12:17:04', NULL, NULL),
(40, 1, 'fg', 'fg', 'juwel123@gmail.com', '01876261415', 'tdh', 'dfgh', 'Cash on Delivery', '', '', '', '', 15990.00, 500.00, 399.75, 16889.75, 'Pending', '2026-01-01 12:27:49', NULL, NULL),
(41, 1, 'xvhg', 'gh', 'juwel@gmail.com', '01876261415', 'gfh', 'ghgh', 'Cash on Delivery', '', '', '', '', 299.99, 500.00, 7.50, 807.49, 'Pending', '2026-01-01 12:28:22', NULL, NULL),
(42, 1, 'SDF', 'sdsds', 'juwel@gmail.com', '1876261415', 'fb', 'fdhg', 'Cash on Delivery', '', '', '', '', 499.99, 500.00, 12.50, 1012.49, 'Pending', '2026-01-01 12:36:54', NULL, NULL),
(43, 1, 'SDF', 'sdsds', 'juwel@gmail.com', '1876261415', 'fb', 'fdhg', 'Cash on Delivery', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 'Pending', '2026-01-01 12:36:54', NULL, NULL),
(44, 1, 'SDF', 'sdsds', 'juwel@gmail.com', '01876261415', 'sadf', 'adf', 'Cash on Delivery', '', '', '', '', 299.99, 500.00, 7.50, 807.49, 'Pending', '2026-01-01 12:46:40', NULL, NULL),
(45, 1, 'SDF', 'ASDF', 'juwel@gmail.com', '1876261415', 'adf', 'adf', 'Cash on Delivery', '', '', '', '', 55000.00, 500.00, 1375.00, 56875.00, 'Pending', '2026-01-01 12:47:08', NULL, NULL),
(46, 1, 'SDF', 'sdsds', 'juwel123@gmail.com', '01876261415', 'adf', 'adf', 'Cash on Delivery', '', '', '', '', 22500.00, 500.00, 562.50, 23562.50, 'Pending', '2026-01-01 12:47:37', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `order_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `order_date`) VALUES
(1, 34, 3, 'Smart Watch Ultra', 15990.00, 3, '2025-12-31 09:13:29'),
(2, 34, 5, 'Starlink Basic Kit', 499.99, 1, '2025-12-31 09:13:29'),
(3, 35, 3, 'Smart Watch Ultra', 15990.00, 1, '2025-12-31 09:13:29'),
(7, 40, NULL, 'Smart Watch Ultra', 15990.00, 1, '2026-01-01 04:27:49'),
(8, 41, NULL, 'Drone Mini', 299.99, 1, '2026-01-01 04:28:22'),
(9, 42, NULL, 'Starlink Basic Kit', 499.99, 1, '2026-01-01 04:36:54'),
(10, 44, 16, 'Drone Mini', 299.99, 1, '2026-01-01 04:46:40'),
(11, 45, NULL, 'Smart TV 55\"', 55000.00, 1, '2026-01-01 04:47:09'),
(12, 46, 27, 'Tablet PC Pro', 22500.00, 1, '2026-01-01 04:47:37');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_status` enum('In Stock','Out of Stock') DEFAULT 'In Stock',
  `description` text DEFAULT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `brand`, `model`, `price`, `stock_status`, `description`, `main_image`, `rating`, `created_at`, `updated_at`, `category_id`) VALUES
(1, 'Smart Watch Pro X', 'Gadget Nest', 'Pro X', 12990.00, 'In Stock', 'Smart Watch Pro X delivers an excellent combination of performance, AMOLED display, Bluetooth calling, SpO2 & heart rate monitoring, and up to 10 days battery life.', 'images/product1.png', 4.30, '2025-12-23 09:57:02', '2026-01-01 13:08:04', NULL),
(2, 'Smart Watch Lite', 'Gadget Nest', 'Lite', 9990.00, 'In Stock', 'Smart Watch Lite offers lightweight design with essential fitness tracking and notifications.', 'images/popular_1.png', 4.00, '2025-12-23 09:57:03', '2026-01-01 13:08:04', NULL),
(3, 'Smart Watch Ultra', 'Gadget Nest', 'Ultra', 15990.00, 'In Stock', 'Smart Watch Ultra provides advanced health tracking, AMOLED display, and extended battery life for fitness enthusiasts.', 'images/popular_2.png', 4.50, '2025-12-23 09:57:03', '2026-01-01 13:08:04', NULL),
(5, 'Starlink Basic Kit', 'Starlink', 'Basic', 499.99, 'In Stock', 'Starlink Basic Kit includes satellite dish, WiFi router, and setup guide for fast internet connectivity anywhere.', 'images/starlink_basic.png', 4.50, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(6, 'Starlink Pro Kit', 'Starlink', 'Pro', 699.99, 'In Stock', 'Starlink Pro Kit with enhanced speed and coverage for uninterrupted high-speed internet experience.', 'images/starlink_pro.png', 4.80, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(7, 'Starlink Basic Kit', 'Starlink', 'Basic', 499.99, 'In Stock', 'Starlink Basic Kit includes satellite dish, WiFi router, and setup guide for fast internet connectivity anywhere.', 'images/starlink_basic.png', 4.50, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(8, 'Starlink Pro Kit', 'Starlink', 'Pro', 699.99, 'In Stock', 'Starlink Pro Kit with enhanced speed and coverage for uninterrupted high-speed internet experience.', 'images/starlink_pro.png', 4.80, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(9, 'Starlink Basic Kit', 'Starlink', 'Basic', 499.99, 'In Stock', 'Starlink Basic Kit includes satellite dish, WiFi router, and setup guide for fast internet connectivity anywhere.', 'images/starlink_basic.png', 4.50, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(10, 'Starlink Pro Kit', 'Starlink', 'Pro', 699.99, 'In Stock', 'Starlink Pro Kit with enhanced speed and coverage for uninterrupted high-speed internet experience.', 'images/starlink_pro.png', 4.80, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 1),
(11, 'Drone X3', 'DroneTech', 'X3', 450.00, 'In Stock', 'Drone X3 is a high-performance drone with 4K camera, GPS, and 3-axis stabilization for smooth aerial shots.', 'images/drone_x3.png', 4.70, '2025-12-23 11:00:53', '2026-01-01 13:08:04', 2),
(12, 'Drone Mini', 'DroneTech', 'Mini', 299.99, 'In Stock', 'Drone Mini is a compact beginner-friendly drone with easy controls and stable flight.', 'images/drone_mini.png', 4.20, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 2),
(13, 'Drone X3', 'DroneTech', 'X3', 450.00, 'In Stock', 'Drone X3 is a high-performance drone with 4K camera, GPS, and 3-axis stabilization for smooth aerial shots.', 'images/drone_x3.png', 4.70, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 2),
(14, 'Drone Mini', 'DroneTech', 'Mini', 299.99, 'In Stock', 'Drone Mini is a compact beginner-friendly drone with easy controls and stable flight.', 'images/drone_mini.png', 4.20, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 2),
(15, 'Drone X3', 'DroneTech', 'X3', 450.00, 'In Stock', 'Drone X3 is a high-performance drone with 4K camera, GPS, and 3-axis stabilization for smooth aerial shots.', 'images/drone_x3.png', 4.70, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 2),
(16, 'Drone Mini', 'DroneTech', 'Mini', 299.99, 'In Stock', 'Drone Mini is a compact beginner-friendly drone with easy controls and stable flight.', 'images/drone_mini.png', 4.20, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 2),
(17, 'Gimbal Stabilizer 2000', 'SteadyCam', '2000', 129.99, 'In Stock', 'Gimbal Stabilizer 2000 provides professional-grade stabilization for cameras to shoot smooth videos.', 'images/gimbal_2000.png', 4.60, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(18, 'Gimbal Mini', 'SteadyCam', 'Mini', 79.99, 'In Stock', 'Gimbal Mini offers portable stabilization for smartphones, perfect for vlogs and casual filming.', 'images/gimbal_mini.png', 4.30, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(19, 'Gimbal Stabilizer 2000', 'SteadyCam', '2000', 129.99, 'In Stock', 'Gimbal Stabilizer 2000 provides professional-grade stabilization for cameras to shoot smooth videos.', 'images/gimbal_2000.png', 4.60, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(20, 'Gimbal Mini', 'SteadyCam', 'Mini', 79.99, 'In Stock', 'Gimbal Mini offers portable stabilization for smartphones, perfect for vlogs and casual filming.', 'images/gimbal_mini.png', 4.30, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(21, 'Gimbal Stabilizer 2000', 'SteadyCam', '2000', 129.99, 'In Stock', 'Gimbal Stabilizer 2000 provides professional-grade stabilization for cameras to shoot smooth videos.', 'images/gimbal_2000.png', 4.60, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(22, 'Gimbal Mini', 'SteadyCam', 'Mini', 79.99, 'In Stock', 'Gimbal Mini offers portable stabilization for smartphones, perfect for vlogs and casual filming.', 'images/gimbal_mini.png', 4.30, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 3),
(23, 'Tablet PC Pro', 'TabTech', 'Pro', 22500.00, 'In Stock', 'Tablet PC Pro is a high-end tablet for professionals, equipped with powerful specs for work and entertainment.', 'images/tablet_pc_pro.png', 5.00, '2025-12-23 11:00:53', '2026-01-01 13:05:29', 4),
(24, 'Tablet PC Lite', 'TabTech', 'Lite', 14500.00, 'In Stock', 'Tablet PC Lite is an affordable tablet for everyday use, suitable for students and casual users.', 'images/tablet_pc_lite.png', 4.20, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 4),
(25, 'Tablet PC Pro', 'TabTech', 'Pro', 22500.00, 'In Stock', 'Tablet PC Pro is a high-end tablet for professionals, equipped with powerful specs for work and entertainment.', 'images/tablet_pc_pro.png', 5.00, '2025-12-23 11:00:53', '2026-01-01 13:05:29', 4),
(26, 'Tablet PC Lite', 'TabTech', 'Lite', 14500.00, 'In Stock', 'Tablet PC Lite is an affordable tablet for everyday use, suitable for students and casual users.', 'images/tablet_pc_lite.png', 4.20, '2025-12-23 11:00:53', '2026-01-01 13:08:05', 4),
(27, 'Tablet PC Pro', 'TabTech', 'Pro', 22500.00, 'In Stock', 'Tablet PC Pro is a high-end tablet for professionals, equipped with powerful specs for work and entertainment.', 'images/tablet_pc_pro.png', 5.00, '2025-12-23 11:00:54', '2026-01-01 13:05:29', 4),
(28, 'Tablet PC Lite', 'TabTech', 'Lite', 14500.00, 'In Stock', 'Tablet PC Lite is an affordable tablet for everyday use, suitable for students and casual users.', 'images/tablet_pc_lite.png', 4.20, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 4),
(29, 'Smart TV 55\"', 'Vision', 'V55', 55000.00, 'In Stock', 'Smart TV 55\" delivers 4K resolution, HDR support, and smart connectivity for an immersive viewing experience.', 'images/tv_55.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(30, 'Smart TV 42\"', 'Vision', 'V42', 35000.00, 'In Stock', 'Smart TV 42\" offers Full HD resolution with HDR support and smart features for home entertainment.', 'images/tv_42.png', 4.40, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(31, 'Smart TV 55\"', 'Vision', 'V55', 55000.00, 'In Stock', 'Smart TV 55\" delivers 4K resolution, HDR support, and smart connectivity for an immersive viewing experience.', 'images/tv_55.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(32, 'Smart TV 42\"', 'Vision', 'V42', 35000.00, 'In Stock', 'Smart TV 42\" offers Full HD resolution with HDR support and smart features for home entertainment.', 'images/tv_42.png', 4.40, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(33, 'Smart TV 55\"', 'Vision', 'V55', 55000.00, 'In Stock', 'Smart TV 55\" delivers 4K resolution, HDR support, and smart connectivity for an immersive viewing experience.', 'images/tv_55.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(34, 'Smart TV 42\"', 'Vision', 'V42', 35000.00, 'In Stock', 'Smart TV 42\" offers Full HD resolution with HDR support and smart features for home entertainment.', 'images/tv_42.png', 4.40, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 5),
(35, 'Phone Max', 'PhoneBrand', 'Max', 30000.00, 'In Stock', 'Phone Max is a high-end smartphone with excellent camera, large display, and long-lasting battery.', 'images/phone_max.png', 4.50, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(36, 'Phone Mini', 'PhoneBrand', 'Mini', 18000.00, 'In Stock', 'Phone Mini is a compact smartphone for everyday use, featuring essential apps and long battery life.', 'images/phone_mini.png', 4.10, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(37, 'Phone Max', 'PhoneBrand', 'Max', 30000.00, 'In Stock', 'Phone Max is a high-end smartphone with excellent camera, large display, and long-lasting battery.', 'images/phone_max.png', 4.50, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(38, 'Phone Mini', 'PhoneBrand', 'Mini', 18000.00, 'In Stock', 'Phone Mini is a compact smartphone for everyday use, featuring essential apps and long battery life.', 'images/phone_mini.png', 4.10, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(39, 'Phone Max', 'PhoneBrand', 'Max', 30000.00, 'In Stock', 'Phone Max is a high-end smartphone with excellent camera, large display, and long-lasting battery.', 'images/phone_max.png', 4.50, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(40, 'Phone Mini', 'PhoneBrand', 'Mini', 18000.00, 'In Stock', 'Phone Mini is a compact smartphone for everyday use, featuring essential apps and long battery life.', 'images/phone_mini.png', 4.10, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 6),
(41, 'Wireless Charger', 'AccBrand', 'WCharger', 1999.00, 'In Stock', 'Wireless Charger provides fast wireless charging for smartphones with safe temperature control.', 'images/wireless_charger.png', 4.60, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(42, 'Phone Case', 'AccBrand', 'Protect', 799.00, 'In Stock', 'Phone Case offers durable protection and stylish design for your smartphone.', 'images/phone_case.png', 4.30, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(43, 'Wireless Charger', 'AccBrand', 'WCharger', 1999.00, 'In Stock', 'Wireless Charger provides fast wireless charging for smartphones with safe temperature control.', 'images/wireless_charger.png', 4.60, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(44, 'Phone Case', 'AccBrand', 'Protect', 799.00, 'In Stock', 'Phone Case offers durable protection and stylish design for your smartphone.', 'images/phone_case.png', 4.30, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(45, 'Wireless Charger', 'AccBrand', 'WCharger', 1999.00, 'In Stock', 'Wireless Charger provides fast wireless charging for smartphones with safe temperature control.', 'images/wireless_charger.png', 4.60, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(46, 'Phone Case', 'AccBrand', 'Protect', 799.00, 'In Stock', 'Phone Case offers durable protection and stylish design for your smartphone.', 'images/phone_case.png', 4.30, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 7),
(47, 'SSD 500GB', 'StoragePro', '500X', 6500.00, 'In Stock', 'SSD 500GB is a portable high-speed storage solution for storing important data securely.', 'images/ssd_500.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:05', 8),
(48, 'SSD 1TB', 'StoragePro', '1TBX', 12000.00, 'In Stock', 'SSD 1TB is a high-capacity portable storage device with fast read/write speeds.', 'images/ssd_1tb.png', 4.80, '2025-12-23 11:00:54', '2026-01-01 13:08:06', 8),
(49, 'SSD 500GB', 'StoragePro', '500X', 6500.00, 'In Stock', 'SSD 500GB is a portable high-speed storage solution for storing important data securely.', 'images/ssd_500.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:06', 8),
(50, 'SSD 1TB', 'StoragePro', '1TBX', 12000.00, 'In Stock', 'SSD 1TB is a high-capacity portable storage device with fast read/write speeds.', 'images/ssd_1tb.png', 4.80, '2025-12-23 11:00:54', '2026-01-01 13:08:06', 8),
(51, 'SSD 500GB', 'StoragePro', '500X', 6500.00, 'In Stock', 'SSD 500GB is a portable high-speed storage solution for storing important data securely.', 'images/ssd_500.png', 4.70, '2025-12-23 11:00:54', '2026-01-01 13:08:06', 8),
(52, 'SSD 1TB', 'StoragePro', '1TBX', 12000.00, 'In Stock', 'SSD 1TB is a high-capacity portable storage device with fast read/write speeds.', 'images/ssd_1tb.png', 4.80, '2025-12-23 11:00:54', '2026-01-01 13:08:06', 8),
(53, 'Smart Watch Pro', 'Gadget Nest', 'Pro X', 12990.00, 'In Stock', 'Smart Watch Pro features AMOLED display, Bluetooth calling, SpO2 & heart rate monitoring, and long battery life.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 11),
(54, 'Smart Watch Lite', 'Gadget Nest', 'Lite Y', 9990.00, 'In Stock', 'Smart Watch Lite offers lightweight design with basic fitness and notification tracking.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 11),
(55, 'Smart Glass Alpha', 'VisionTech', 'Alpha', 25000.00, 'In Stock', 'Smart Glass Alpha provides AR notifications, camera, and hands-free interactions.', 'images/placeholder.png', 4.20, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 17),
(56, 'Smart Glass Beta', 'VisionTech', 'Beta', 19999.00, 'In Stock', 'Smart Glass Beta is an affordable AR device for everyday use with basic features.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 17),
(57, 'Power Bank 10000mAh', 'ChargeUp', 'C100', 2500.00, 'In Stock', 'Power Bank 10000mAh offers compact design and fast charging for smartphones and small devices.', 'images/placeholder.png', 4.50, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 19),
(58, 'Power Bank 20000mAh', 'ChargeUp', 'C200', 4500.00, 'In Stock', 'Power Bank 20000mAh provides high capacity dual-port charging for multiple devices on the go.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 19),
(59, 'WiFi Router X1', 'NetGear', 'X1', 5500.00, 'In Stock', 'WiFi Router X1 offers dual-band connectivity for stable internet at home.', 'images/placeholder.png', 4.10, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 20),
(60, 'WiFi Router Pro', 'NetGear', 'Pro', 8500.00, 'In Stock', 'WiFi Router Pro provides high-speed connectivity with extended coverage and advanced features.', 'images/placeholder.png', 4.40, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 20),
(61, 'Gaming Monitor 24\"', 'ViewPlus', 'G24', 18000.00, 'In Stock', 'Gaming Monitor 24\" features Full HD resolution with 144Hz refresh rate for smooth gaming visuals.', 'images/placeholder.png', 4.20, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 24),
(62, 'Office Monitor 27\"', 'ViewPlus', 'O27', 15500.00, 'In Stock', 'Office Monitor 27\" provides IPS panel with eye-care mode and full HD resolution for productivity.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 24),
(63, 'Mechanical Keyboard X', 'KeyMaster', 'MX1', 4500.00, 'In Stock', 'Mechanical Keyboard X features RGB backlit keys and programmable macros for gaming.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 22),
(64, 'Wireless Keyboard Y', 'KeyMaster', 'WY', 3500.00, 'In Stock', 'Wireless Keyboard Y is slim, lightweight, and perfect for everyday typing.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 22),
(65, 'Gaming Mouse Ultra', 'MousePro', 'GMU', 3000.00, 'In Stock', 'Gaming Mouse Ultra offers ergonomic design, programmable buttons, and precision tracking.', 'images/placeholder.png', 4.50, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 21),
(66, 'Gaming Mouse Lite', 'MousePro', 'GML', 1800.00, 'In Stock', 'Gaming Mouse Lite is lightweight and suitable for casual gaming.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 21),
(67, 'Gaming Console X', 'GameHub', 'GX', 68000.00, 'In Stock', 'Gaming Console X delivers next-gen gaming experience with powerful graphics and speed.', 'images/placeholder.png', 4.40, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 16),
(68, 'Gaming Console Mini', 'GameHub', 'GCM', 45000.00, 'In Stock', 'Gaming Console Mini is compact and perfect for casual gaming.', 'images/placeholder.png', 4.20, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 16),
(69, 'In-Ear Earphones A1', 'SoundMax', 'A1', 1200.00, 'In Stock', 'In-Ear Earphones A1 provides high-quality sound with noise isolation for everyday use.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 13),
(70, 'In-Ear Earphones B2', 'SoundMax', 'B2', 1500.00, 'In Stock', 'In-Ear Earphones B2 are comfortable and suitable for long listening sessions.', 'images/placeholder.png', 4.20, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 13),
(71, 'Wireless Earbuds X', 'SoundMax', 'WX', 3500.00, 'In Stock', 'Wireless Earbuds X provide true wireless experience with charging case and good sound quality.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 14),
(72, 'Wireless Earbuds Y', 'SoundMax', 'WY', 4000.00, 'In Stock', 'Wireless Earbuds Y offer compact design, good bass, and easy portability.', 'images/placeholder.png', 4.50, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 14),
(73, 'Camera Lens 50mm', 'PhotoPro', 'L50', 12500.00, 'In Stock', 'Camera Lens 50mm is a prime lens suitable for DSLR photography with sharp images.', 'images/placeholder.png', 4.20, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 23),
(74, 'Camera Lens 85mm', 'PhotoPro', 'L85', 15500.00, 'In Stock', 'Camera Lens 85mm is ideal for portrait photography with excellent depth and clarity.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 23),
(75, 'Bluetooth Speaker Mini', 'SoundMax', 'BSM', 3490.00, 'In Stock', 'Bluetooth Speaker Mini offers portable and clear sound for casual listening.', 'images/placeholder.png', 4.00, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 15),
(76, 'Bluetooth Speaker Pro', 'SoundMax', 'BSP', 5990.00, 'In Stock', 'Bluetooth Speaker Pro delivers powerful bass and immersive audio experience.', 'images/placeholder.png', 4.40, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 15),
(77, 'Action Camera X', 'CamGo', 'ACX', 12000.00, 'In Stock', 'Action Camera X is waterproof 4K camera perfect for adventure and sports filming.', 'images/placeholder.png', 4.30, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 12),
(78, 'Action Camera Pro', 'CamGo', 'ACP', 15000.00, 'In Stock', 'Action Camera Pro offers high-end 4K recording with advanced features for professional action shots.', 'images/placeholder.png', 4.50, '2025-12-23 11:08:47', '2026-01-01 13:08:06', 12);

-- --------------------------------------------------------

--
-- Table structure for table `product_features`
--

CREATE TABLE `product_features` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `feature` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_features`
--

INSERT INTO `product_features` (`id`, `product_id`, `feature`) VALUES
(1, 1, 'AMOLED Touch Display'),
(2, 1, 'Bluetooth Calling'),
(3, 1, 'SpO2 & Heart Rate Monitor'),
(4, 1, 'IP68 Water Resistance'),
(5, 1, 'Up to 10 Days Battery Life'),
(6, 1, 'AMOLED Display'),
(7, 1, 'Bluetooth Calling'),
(8, 1, 'Heart Rate Monitor'),
(9, 2, 'Lightweight Design'),
(10, 2, 'Step Counter'),
(11, 3, 'Long Battery Life'),
(12, 3, 'Sleep Tracking'),
(13, 53, 'AMOLED Display'),
(14, 53, 'Bluetooth Calling'),
(15, 53, 'Heart Rate Monitor'),
(16, 54, 'Lightweight Design'),
(17, 54, 'Step Counter'),
(18, 5, 'Satellite Dish'),
(19, 5, 'WiFi Router'),
(20, 6, 'High-speed Connectivity'),
(21, 6, 'Extended Coverage'),
(22, 7, 'Satellite Dish'),
(23, 7, 'WiFi Router'),
(24, 8, 'High-speed Connectivity'),
(25, 8, 'Extended Coverage'),
(26, 11, '4K Camera'),
(27, 11, 'GPS Assisted Flight'),
(28, 12, 'Compact Design'),
(29, 12, 'Beginner Friendly'),
(30, 13, '4K Camera'),
(31, 14, 'Compact Design'),
(32, 17, '3-Axis Stabilization'),
(33, 17, 'Lightweight'),
(34, 18, 'Portable for Smartphones'),
(35, 18, 'Quick Setup'),
(36, 23, 'High-resolution Display'),
(37, 23, 'Fast Processor'),
(38, 24, 'Affordable'),
(39, 24, 'Lightweight'),
(40, 29, '4K UHD Display'),
(41, 29, 'Smart Features'),
(42, 30, 'HDR Support'),
(43, 30, 'Slim Design'),
(44, 35, 'High-end Camera'),
(45, 35, 'Fast Processor'),
(46, 36, 'Compact Design'),
(47, 36, 'Long Battery Life'),
(48, 41, 'Fast Wireless Charging'),
(49, 42, 'Durable Material'),
(50, 47, '500GB Storage'),
(51, 48, '1TB Storage'),
(52, 49, '500GB Storage'),
(53, 50, '1TB Storage'),
(54, 55, 'AR Display'),
(55, 55, 'Camera'),
(56, 56, 'Lightweight Design'),
(57, 57, 'High Capacity'),
(58, 58, 'Dual USB Ports'),
(59, 59, 'Dual-band'),
(60, 60, 'Extended Coverage'),
(61, 61, '144Hz Refresh Rate'),
(62, 62, 'Eye-care Mode'),
(63, 63, 'RGB Backlit'),
(64, 64, 'Wireless'),
(65, 65, 'Ergonomic'),
(66, 66, 'Lightweight'),
(67, 67, 'Next-gen Graphics'),
(68, 68, 'Compact'),
(69, 69, 'Noise Isolating'),
(70, 70, 'Comfortable Fit'),
(71, 71, 'Bluetooth'),
(72, 72, 'Portable'),
(73, 73, 'Prime Lens'),
(74, 74, 'Portrait Lens'),
(75, 75, 'Portable'),
(76, 76, 'Powerful Bass'),
(77, 77, 'Waterproof'),
(78, 78, '4K Recording'),
(79, 1, 'AMOLED Display'),
(80, 1, 'Bluetooth Calling'),
(81, 1, 'Heart Rate Monitor'),
(82, 2, 'Lightweight Design'),
(83, 2, 'Step Counter'),
(84, 3, 'Long Battery Life'),
(85, 3, 'Sleep Tracking'),
(86, 53, 'AMOLED Display'),
(87, 53, 'Bluetooth Calling'),
(88, 53, 'Heart Rate Monitor'),
(89, 54, 'Lightweight Design'),
(90, 54, 'Step Counter'),
(91, 5, 'Satellite Dish'),
(92, 5, 'WiFi Router'),
(93, 6, 'High-speed Connectivity'),
(94, 6, 'Extended Coverage'),
(95, 7, 'Satellite Dish'),
(96, 7, 'WiFi Router'),
(97, 8, 'High-speed Connectivity'),
(98, 8, 'Extended Coverage'),
(99, 11, '4K Camera'),
(100, 11, 'GPS Assisted Flight'),
(101, 12, 'Compact Design'),
(102, 12, 'Beginner Friendly'),
(103, 13, '4K Camera'),
(104, 14, 'Compact Design'),
(105, 17, '3-Axis Stabilization'),
(106, 17, 'Lightweight'),
(107, 18, 'Portable for Smartphones'),
(108, 18, 'Quick Setup'),
(109, 23, 'High-resolution Display'),
(110, 23, 'Fast Processor'),
(111, 24, 'Affordable'),
(112, 24, 'Lightweight'),
(113, 29, '4K UHD Display'),
(114, 29, 'Smart Features'),
(115, 30, 'HDR Support'),
(116, 30, 'Slim Design'),
(117, 35, 'High-end Camera'),
(118, 35, 'Fast Processor'),
(119, 36, 'Compact Design'),
(120, 36, 'Long Battery Life'),
(121, 41, 'Fast Wireless Charging'),
(122, 42, 'Durable Material'),
(123, 47, '500GB Storage'),
(124, 48, '1TB Storage'),
(125, 49, '500GB Storage'),
(126, 50, '1TB Storage'),
(127, 55, 'AR Display'),
(128, 55, 'Camera'),
(129, 56, 'Lightweight Design'),
(130, 57, 'High Capacity'),
(131, 58, 'Dual USB Ports'),
(132, 59, 'Dual-band'),
(133, 60, 'Extended Coverage'),
(134, 61, '144Hz Refresh Rate'),
(135, 62, 'Eye-care Mode'),
(136, 63, 'RGB Backlit'),
(137, 64, 'Wireless'),
(138, 65, 'Ergonomic'),
(139, 66, 'Lightweight'),
(140, 67, 'Next-gen Graphics'),
(141, 68, 'Compact'),
(142, 69, 'Noise Isolating'),
(143, 70, 'Comfortable Fit'),
(144, 71, 'Bluetooth'),
(145, 72, 'Portable'),
(146, 73, 'Prime Lens'),
(147, 74, 'Portrait Lens'),
(148, 75, 'Portable'),
(149, 76, 'Powerful Bass'),
(150, 77, 'Waterproof'),
(151, 78, '4K Recording'),
(152, 1, 'AMOLED Touch Display'),
(153, 1, 'Bluetooth Calling'),
(154, 1, 'SpO2 & Heart Rate Monitor'),
(155, 1, 'IP68 Water Resistance'),
(156, 1, 'Up to 10 Days Battery Life'),
(157, 2, 'Lightweight design'),
(158, 2, 'Heart Rate Monitor'),
(159, 2, 'Sleep Tracking'),
(160, 2, 'Step Counter'),
(161, 3, 'AMOLED Display'),
(162, 3, 'Bluetooth v5.0'),
(163, 3, 'GPS Tracking'),
(164, 3, 'Long Battery Life'),
(165, 5, 'Starlink Satellite Dish'),
(166, 5, 'WiFi Router Included'),
(167, 5, 'Easy Installation'),
(168, 6, 'High-Speed Internet'),
(169, 6, 'Extended Coverage'),
(170, 6, 'Weather Resistant'),
(171, 7, 'Starlink Satellite Dish'),
(172, 7, 'WiFi Router Included'),
(173, 7, 'Easy Installation'),
(174, 8, 'High-Speed Internet'),
(175, 8, 'Extended Coverage'),
(176, 8, 'Weather Resistant'),
(177, 9, 'Starlink Satellite Dish'),
(178, 9, 'WiFi Router Included'),
(179, 9, 'Easy Installation'),
(180, 10, 'High-Speed Internet'),
(181, 10, 'Extended Coverage'),
(182, 10, 'Weather Resistant'),
(183, 11, '4K Camera'),
(184, 11, 'High-Performance Motors'),
(185, 11, 'GPS Assisted Flight'),
(186, 12, 'Compact Design'),
(187, 12, 'Beginner Friendly'),
(188, 12, 'Lightweight'),
(189, 13, '4K Camera'),
(190, 13, 'High-Performance Motors'),
(191, 13, 'GPS Assisted Flight'),
(192, 14, 'Compact Design'),
(193, 14, 'Beginner Friendly'),
(194, 14, 'Lightweight'),
(195, 15, '4K Camera'),
(196, 15, 'High-Performance Motors'),
(197, 15, 'GPS Assisted Flight'),
(198, 16, 'Compact Design'),
(199, 16, 'Beginner Friendly'),
(200, 16, 'Lightweight'),
(201, 17, '3-Axis Stabilization'),
(202, 17, 'Lightweight Design'),
(203, 17, 'Smooth Video Recording'),
(204, 18, 'Portable Gimbal'),
(205, 18, 'Smartphone Compatible'),
(206, 18, 'Foldable Design'),
(207, 19, '3-Axis Stabilization'),
(208, 19, 'Lightweight Design'),
(209, 19, 'Smooth Video Recording'),
(210, 20, 'Portable Gimbal'),
(211, 20, 'Smartphone Compatible'),
(212, 20, 'Foldable Design'),
(213, 21, '3-Axis Stabilization'),
(214, 21, 'Lightweight Design'),
(215, 21, 'Smooth Video Recording'),
(216, 22, 'Portable Gimbal'),
(217, 22, 'Smartphone Compatible'),
(218, 22, 'Foldable Design'),
(219, 23, 'High-End Performance'),
(220, 23, 'Large Screen'),
(221, 23, 'Multi-Touch Display'),
(222, 24, 'Affordable'),
(223, 24, 'Portable'),
(224, 24, 'Long Battery Life'),
(225, 25, 'High-End Performance'),
(226, 25, 'Large Screen'),
(227, 25, 'Multi-Touch Display'),
(228, 26, 'Affordable'),
(229, 26, 'Portable'),
(230, 26, 'Long Battery Life'),
(231, 27, 'High-End Performance'),
(232, 27, 'Large Screen'),
(233, 27, 'Multi-Touch Display'),
(234, 28, 'Affordable'),
(235, 28, 'Portable'),
(236, 28, 'Long Battery Life'),
(237, 29, '4K Resolution'),
(238, 29, 'Smart TV Features'),
(239, 29, 'HDR Support'),
(240, 30, 'Full HD'),
(241, 30, 'HDR Support'),
(242, 30, 'Smart TV Apps'),
(243, 31, '4K Resolution'),
(244, 31, 'Smart TV Features'),
(245, 31, 'HDR Support'),
(246, 32, 'Full HD'),
(247, 32, 'HDR Support'),
(248, 32, 'Smart TV Apps'),
(249, 33, '4K Resolution'),
(250, 33, 'Smart TV Features'),
(251, 33, 'HDR Support'),
(252, 34, 'Full HD'),
(253, 34, 'HDR Support'),
(254, 34, 'Smart TV Apps'),
(255, 35, 'High-End Camera'),
(256, 35, 'Fast Processor'),
(257, 35, 'Long Battery Life'),
(258, 36, 'Compact Design'),
(259, 36, 'Lightweight'),
(260, 36, 'Affordable'),
(261, 37, 'High-End Camera'),
(262, 37, 'Fast Processor'),
(263, 37, 'Long Battery Life'),
(264, 38, 'Compact Design'),
(265, 38, 'Lightweight'),
(266, 38, 'Affordable'),
(267, 39, 'High-End Camera'),
(268, 39, 'Fast Processor'),
(269, 39, 'Long Battery Life'),
(270, 40, 'Compact Design'),
(271, 40, 'Lightweight'),
(272, 40, 'Affordable'),
(273, 41, 'Fast Wireless Charging'),
(274, 41, 'Compatible with Most Phones'),
(275, 41, 'Compact Size'),
(276, 42, 'Durable Case'),
(277, 42, 'Shock Absorption'),
(278, 42, 'Stylish Design'),
(279, 43, 'Fast Wireless Charging'),
(280, 43, 'Compatible with Most Phones'),
(281, 43, 'Compact Size'),
(282, 44, 'Durable Case'),
(283, 44, 'Shock Absorption'),
(284, 44, 'Stylish Design'),
(285, 45, 'Fast Wireless Charging'),
(286, 45, 'Compatible with Most Phones'),
(287, 45, 'Compact Size'),
(288, 46, 'Durable Case'),
(289, 46, 'Shock Absorption'),
(290, 46, 'Stylish Design'),
(291, 47, '500GB Storage'),
(292, 47, 'Portable'),
(293, 47, 'High-Speed Transfer'),
(294, 48, '1TB Storage'),
(295, 48, 'Portable'),
(296, 48, 'High-Speed Transfer'),
(297, 49, '500GB Storage'),
(298, 49, 'Portable'),
(299, 49, 'High-Speed Transfer'),
(300, 50, '1TB Storage'),
(301, 50, 'Portable'),
(302, 50, 'High-Speed Transfer'),
(303, 51, '500GB Storage'),
(304, 51, 'Portable'),
(305, 51, 'High-Speed Transfer'),
(306, 52, '1TB Storage'),
(307, 52, 'Portable'),
(308, 52, 'High-Speed Transfer'),
(309, 53, 'AMOLED Display'),
(310, 53, 'Bluetooth Calling'),
(311, 53, 'Heart Rate & SpO2 Monitor'),
(312, 54, 'Lightweight'),
(313, 54, 'Basic Fitness Tracking'),
(314, 54, 'Sleep Monitoring'),
(315, 55, 'AR Notifications'),
(316, 55, 'Built-in Camera'),
(317, 55, 'Lightweight'),
(318, 56, 'Affordable AR Glasses'),
(319, 56, 'Notifications Support'),
(320, 56, 'Lightweight'),
(321, 57, 'Compact Power Bank'),
(322, 57, 'Fast Charging'),
(323, 57, 'Dual USB Ports'),
(324, 58, 'High Capacity'),
(325, 58, 'Dual USB Ports'),
(326, 58, 'LED Indicators'),
(327, 59, 'Dual-Band WiFi'),
(328, 59, 'Easy Setup'),
(329, 59, 'Compact Design'),
(330, 60, 'High-Speed WiFi'),
(331, 60, 'Extended Coverage'),
(332, 60, 'Parental Controls'),
(333, 61, 'Full HD Display'),
(334, 61, '144Hz Refresh Rate'),
(335, 61, 'Low Response Time'),
(336, 62, 'IPS Panel'),
(337, 62, 'Eye-Care Mode'),
(338, 62, 'Adjustable Stand'),
(339, 63, 'RGB Backlit'),
(340, 63, 'Mechanical Keys'),
(341, 63, 'Durable Build'),
(342, 64, 'Slim Wireless'),
(343, 64, 'Long Battery Life'),
(344, 64, 'Ergonomic Design'),
(345, 65, 'Ergonomic Design'),
(346, 65, 'Programmable Buttons'),
(347, 65, 'High DPI Sensitivity'),
(348, 66, 'Lightweight'),
(349, 66, 'High DPI'),
(350, 66, 'Ergonomic Grip'),
(351, 67, 'Next-Gen Console'),
(352, 67, '4K Gaming Support'),
(353, 67, 'Fast Load Times'),
(354, 68, 'Compact Console'),
(355, 68, 'Casual Gaming'),
(356, 68, 'Easy Setup'),
(357, 69, 'Noise Isolating'),
(358, 69, 'High-Quality Audio'),
(359, 69, 'Comfortable Fit'),
(360, 70, 'Comfortable Fit'),
(361, 70, 'Daily Use'),
(362, 70, 'Durable'),
(363, 71, 'Bluetooth Earbuds'),
(364, 71, 'Charging Case Included'),
(365, 71, 'Good Bass'),
(366, 72, 'Compact Design'),
(367, 72, 'Good Bass'),
(368, 72, 'Long Battery Life'),
(369, 73, 'Prime Lens'),
(370, 73, 'DSLR Compatible'),
(371, 73, 'Lightweight'),
(372, 74, 'Portrait Lens'),
(373, 74, 'High-Quality Glass'),
(374, 74, 'DSLR Compatible'),
(375, 75, 'Portable Mini Speaker'),
(376, 75, 'Good Sound Quality'),
(377, 75, 'Compact Design'),
(378, 76, 'Powerful Bass'),
(379, 76, 'Bluetooth Connectivity'),
(380, 76, 'Portable Design'),
(381, 77, 'Waterproof 4K'),
(382, 77, 'High Frame Rate'),
(383, 77, 'Lightweight'),
(384, 78, 'High-End Action Camera'),
(385, 78, '4K Video'),
(386, 78, 'Durable Build');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_main`) VALUES
(1, 1, 'images/product1.png', 1),
(2, 1, 'images/product1_side.png', 0),
(3, 1, 'images/product1_back.png', 0),
(4, 1, 'images/product1_main.png', 1),
(5, 1, 'images/product1_side.png', 0),
(6, 1, 'images/product1_back.png', 0),
(7, 2, 'images/product2_main.png', 1),
(8, 2, 'images/product2_side.png', 0),
(9, 2, 'images/product2_back.png', 0),
(10, 3, 'images/product3_main.png', 1),
(11, 3, 'images/product3_side.png', 0),
(12, 3, 'images/product3_back.png', 0),
(13, 78, 'images/product78_main.png', 1),
(14, 78, 'images/product78_side.png', 0),
(15, 78, 'images/product78_back.png', 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `customer_name`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 'John Doe', 5.0, 'Battery lasts really long and the display is super clear. Very happy!', '2025-12-23 09:57:02'),
(2, 1, 'Jane Smith', 5.0, 'Bluetooth calling is smooth, stylish, and fits perfectly on my wrist.', '2025-12-23 09:57:02'),
(3, 1, 'Ahmed Khan', 5.0, 'Good product, but I expected a slightly longer battery life.', '2025-12-23 09:57:02'),
(4, 1, 'juwel forazi', 1.0, 'adf', '2025-12-30 10:58:13'),
(5, 1, 'juwel forazi', 1.0, 'adf', '2025-12-30 10:58:24'),
(6, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 10:59:37'),
(7, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:03:20'),
(8, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:03:20'),
(9, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:04:15'),
(10, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:05:54'),
(11, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:05:58'),
(12, 1, 'juwel forazi', 4.0, 'hiop', '2025-12-30 11:06:09'),
(13, 15, 'juwel forazi', 4.0, 'lakjhdfl', '2025-12-30 12:05:24'),
(14, 1, 'Alice', 5.0, 'Excellent smartwatch!', '2026-01-01 13:03:22'),
(15, 1, 'Bob', 4.0, 'Good, but battery could be better.', '2026-01-01 13:03:22'),
(16, 2, 'Charlie', 4.5, 'Lightweight and comfortable.', '2026-01-01 13:03:22'),
(17, 3, 'David', 5.0, 'Amazing features!', '2026-01-01 13:03:22'),
(18, 11, 'Eve', 4.5, 'Drone camera quality is superb.', '2026-01-01 13:03:22'),
(19, 23, 'Frank', 5.0, 'Tablet works flawlessly.', '2026-01-01 13:03:22'),
(20, 29, 'Grace', 4.5, 'TV has vibrant colors.', '2026-01-01 13:03:22'),
(21, 35, 'Hannah', 5.0, 'Phone camera is incredible.', '2026-01-01 13:03:22'),
(22, 41, 'Ivan', 4.0, 'Charger works fast.', '2026-01-01 13:03:22'),
(23, 47, 'Jack', 4.5, 'SSD is very fast.', '2026-01-01 13:03:22'),
(24, 55, 'Karen', 4.0, 'Smart glass is cool and lightweight.', '2026-01-01 13:03:22'),
(25, 57, 'Leo', 5.0, 'Power bank charges quickly.', '2026-01-01 13:03:22'),
(26, 67, 'Mia', 5.0, 'Gaming console is amazing.', '2026-01-01 13:03:22'),
(27, 77, 'Nina', 4.5, 'Action camera works great underwater.', '2026-01-01 13:03:22');

-- --------------------------------------------------------

--
-- Table structure for table `product_specifications`
--

CREATE TABLE `product_specifications` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `spec_name` varchar(100) NOT NULL,
  `spec_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_specifications`
--

INSERT INTO `product_specifications` (`id`, `product_id`, `spec_name`, `spec_value`) VALUES
(1, 1, 'Display Type', 'AMOLED'),
(2, 1, 'Bluetooth', 'Yes (v5.0)'),
(3, 1, 'Water Resistance', 'IP68 Certified'),
(4, 1, 'Battery Life', 'Up to 10 Days'),
(5, 1, 'Weight', '45g'),
(6, 1, 'Color', 'Black'),
(7, 1, 'Display', 'AMOLED'),
(8, 1, 'Battery Life', '10 Days'),
(9, 2, 'Display', 'LCD'),
(10, 2, 'Battery Life', '7 Days'),
(11, 3, 'Display', 'AMOLED'),
(12, 3, 'Battery Life', '15 Days'),
(13, 11, 'Camera', '4K'),
(14, 11, 'Flight Time', '30 mins'),
(15, 23, 'Processor', 'Octa-core'),
(16, 23, 'RAM', '8GB'),
(17, 29, 'Screen Size', '55 inch'),
(18, 29, 'Resolution', '4K UHD'),
(19, 35, 'Camera', '108MP'),
(20, 35, 'Storage', '256GB'),
(21, 41, 'Charging Speed', '15W'),
(22, 47, 'Capacity', '500GB'),
(23, 55, 'Display Type', 'AR'),
(24, 57, 'Capacity', '10000mAh'),
(25, 67, 'CPU', 'Custom AMD'),
(26, 77, 'Video Quality', '4K'),
(27, 1, 'Display', 'AMOLED'),
(28, 1, 'Battery Life', '10 Days'),
(29, 2, 'Display', 'LCD'),
(30, 2, 'Battery Life', '7 Days'),
(31, 3, 'Display', 'AMOLED'),
(32, 3, 'Battery Life', '15 Days'),
(33, 11, 'Camera', '4K'),
(34, 11, 'Flight Time', '30 mins'),
(35, 23, 'Processor', 'Octa-core'),
(36, 23, 'RAM', '8GB'),
(37, 29, 'Screen Size', '55 inch'),
(38, 29, 'Resolution', '4K UHD'),
(39, 35, 'Camera', '108MP'),
(40, 35, 'Storage', '256GB'),
(41, 41, 'Charging Speed', '15W'),
(42, 47, 'Capacity', '500GB'),
(43, 55, 'Display Type', 'AR'),
(44, 57, 'Capacity', '10000mAh'),
(45, 67, 'CPU', 'Custom AMD'),
(46, 77, 'Video Quality', '4K'),
(47, 1, 'Display', '1.78 inch AMOLED'),
(48, 1, 'Battery', '300 mAh, 10 days'),
(49, 1, 'Connectivity', 'Bluetooth 5.0, WiFi'),
(50, 1, 'Water Resistance', 'IP68'),
(51, 2, 'Display', '1.5 inch LCD'),
(52, 2, 'Battery', '200 mAh, 7 days'),
(53, 2, 'Connectivity', 'Bluetooth 4.2'),
(54, 2, 'Weight', '25 g'),
(55, 3, 'Display', '1.6 inch AMOLED'),
(56, 3, 'Battery', '350 mAh, 12 days'),
(57, 3, 'Connectivity', 'Bluetooth 5.1, GPS'),
(58, 5, 'Type', 'Satellite Internet'),
(59, 5, 'Speed', '150 Mbps'),
(60, 5, 'Router', 'Included'),
(61, 5, 'Installation', 'Easy Setup'),
(62, 6, 'Type', 'High-Speed Internet'),
(63, 6, 'Coverage', 'Extended'),
(64, 6, 'Weather Resistance', 'Yes'),
(65, 7, 'Type', 'Satellite Internet'),
(66, 7, 'Speed', '150 Mbps'),
(67, 7, 'Router', 'Included'),
(68, 8, 'Type', 'High-Speed Internet'),
(69, 8, 'Coverage', 'Extended'),
(70, 8, 'Weather Resistance', 'Yes'),
(71, 9, 'Type', 'Satellite Internet'),
(72, 9, 'Speed', '150 Mbps'),
(73, 9, 'Router', 'Included'),
(74, 10, 'Type', 'High-Speed Internet'),
(75, 10, 'Coverage', 'Extended'),
(76, 10, 'Weather Resistance', 'Yes'),
(77, 11, 'Camera', '4K Ultra HD'),
(78, 11, 'Motors', 'Brushless, High Performance'),
(79, 11, 'GPS', 'Enabled'),
(80, 12, 'Weight', '450 g'),
(81, 12, 'Flight Time', '20 min'),
(82, 12, 'Beginner Friendly', 'Yes'),
(83, 13, 'Camera', '4K Ultra HD'),
(84, 13, 'Motors', 'High Performance'),
(85, 13, 'GPS', 'Enabled'),
(86, 14, 'Weight', '480 g'),
(87, 14, 'Flight Time', '22 min'),
(88, 14, 'Beginner Friendly', 'Yes'),
(89, 15, 'Camera', '4K Ultra HD'),
(90, 15, 'Motors', 'High Performance'),
(91, 15, 'GPS', 'Enabled'),
(92, 16, 'Weight', '500 g'),
(93, 16, 'Flight Time', '25 min'),
(94, 16, 'Beginner Friendly', 'Yes'),
(95, 17, 'Stabilization', '3-Axis'),
(96, 17, 'Weight', '300 g'),
(97, 17, 'Video', 'Smooth Recording'),
(98, 18, 'Compatibility', 'Smartphones'),
(99, 18, 'Design', 'Foldable'),
(100, 18, 'Weight', '350 g'),
(101, 19, 'Stabilization', '3-Axis'),
(102, 19, 'Weight', '320 g'),
(103, 19, 'Video', 'Smooth Recording'),
(104, 20, 'Compatibility', 'Smartphones'),
(105, 20, 'Design', 'Foldable'),
(106, 20, 'Weight', '360 g'),
(107, 21, 'Stabilization', '3-Axis'),
(108, 21, 'Weight', '330 g'),
(109, 21, 'Video', 'Smooth Recording'),
(110, 22, 'Compatibility', 'Smartphones'),
(111, 22, 'Design', 'Foldable'),
(112, 22, 'Weight', '340 g'),
(113, 23, 'Processor', 'Octa-core'),
(114, 23, 'Display', '6.5 inch AMOLED'),
(115, 23, 'RAM', '8 GB'),
(116, 24, 'Processor', 'Quad-core'),
(117, 24, 'Display', '5.5 inch LCD'),
(118, 24, 'Battery', '3000 mAh'),
(119, 25, 'Processor', 'Octa-core'),
(120, 25, 'Display', '6.5 inch AMOLED'),
(121, 25, 'RAM', '8 GB'),
(122, 26, 'Processor', 'Quad-core'),
(123, 26, 'Display', '5.5 inch LCD'),
(124, 26, 'Battery', '3000 mAh'),
(125, 27, 'Processor', 'Octa-core'),
(126, 27, 'Display', '6.5 inch AMOLED'),
(127, 27, 'RAM', '8 GB'),
(128, 28, 'Processor', 'Quad-core'),
(129, 28, 'Display', '5.5 inch LCD'),
(130, 28, 'Battery', '3000 mAh'),
(131, 29, 'Resolution', '4K UHD'),
(132, 29, 'Smart Features', 'Yes'),
(133, 29, 'HDR', 'Yes'),
(134, 30, 'Resolution', 'Full HD'),
(135, 30, 'Smart Features', 'Yes'),
(136, 30, 'HDR', 'Yes'),
(137, 31, 'Resolution', '4K UHD'),
(138, 31, 'Smart Features', 'Yes'),
(139, 31, 'HDR', 'Yes'),
(140, 32, 'Resolution', 'Full HD'),
(141, 32, 'Smart Features', 'Yes'),
(142, 32, 'HDR', 'Yes'),
(143, 33, 'Resolution', '4K UHD'),
(144, 33, 'Smart Features', 'Yes'),
(145, 33, 'HDR', 'Yes'),
(146, 34, 'Resolution', 'Full HD'),
(147, 34, 'Smart Features', 'Yes'),
(148, 34, 'HDR', 'Yes'),
(149, 35, 'Camera', '108 MP'),
(150, 35, 'Processor', 'Snapdragon 8 Gen 1'),
(151, 35, 'Battery', '5000 mAh'),
(152, 36, 'Weight', '180 g'),
(153, 36, 'Display', '6 inch LCD'),
(154, 36, 'Battery', '4000 mAh'),
(155, 37, 'Camera', '108 MP'),
(156, 37, 'Processor', 'Snapdragon 8 Gen 1'),
(157, 37, 'Battery', '5000 mAh'),
(158, 38, 'Weight', '190 g'),
(159, 38, 'Display', '6 inch LCD'),
(160, 38, 'Battery', '4000 mAh'),
(161, 39, 'Camera', '108 MP'),
(162, 39, 'Processor', 'Snapdragon 8 Gen 1'),
(163, 39, 'Battery', '5000 mAh'),
(164, 40, 'Weight', '185 g'),
(165, 40, 'Display', '6 inch LCD'),
(166, 40, 'Battery', '4000 mAh');

-- --------------------------------------------------------

--
-- Table structure for table `related_products`
--

CREATE TABLE `related_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `related_product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `related_products`
--

INSERT INTO `related_products` (`id`, `product_id`, `related_product_id`) VALUES
(1, 1, 1),
(2, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `method` enum('bKash','Nagad','Card Payment') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `created_at`) VALUES
(1, 'juwel forazi', 'juwel@gmail.com', 'juwel', '2025-12-23 08:26:57'),
(5, 'mahadi', 'm@gmail.com', 'mahadi123', '2025-12-23 09:26:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indexes for table `product_features`
--
ALTER TABLE `product_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `related_products`
--
ALTER TABLE `related_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `related_product_id` (`related_product_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `product_features`
--
ALTER TABLE `product_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=387;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product_specifications`
--
ALTER TABLE `product_specifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;

--
-- AUTO_INCREMENT for table `related_products`
--
ALTER TABLE `related_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_features`
--
ALTER TABLE `product_features`
  ADD CONSTRAINT `product_features_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD CONSTRAINT `product_specifications_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `related_products`
--
ALTER TABLE `related_products`
  ADD CONSTRAINT `related_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `related_products_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
