-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 19, 2025 at 01:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `huzaapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `agency`
--

CREATE TABLE `agency` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agency`
--

INSERT INTO `agency` (`id`, `name`, `email`, `password`) VALUES
(1, 'Electricity Department', 'electricity@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(21, 'Water Supply Authority', 'water@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(22, 'Gas Services Department', 'gas@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(23, 'Public Health Department', 'health@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(24, 'Police Department', 'police@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(25, 'Fire Department', 'fire@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(26, 'Environmental Protection Agency', 'environmental@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(27, 'Transportation Department', 'transportation@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(28, 'Housing Authority', 'housing@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(29, 'Consumer Protection Agency', 'consumer@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(30, 'Road Maintenance Department', 'road@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(31, 'Sanitation Services', 'sanitation@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(32, 'Traffic Control Authority', 'traffic@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(33, 'Telecommunications Department', 'telecommunications@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(34, 'Waste Management Department', 'waste@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(35, 'Disaster Management Agency', 'disaster@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(36, 'Education Department', 'education@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(37, 'Social Services Department', 'social@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.'),
(38, 'Emergency Medical Services', 'emergency@gmail.com', '$2y$10$YCdaSiePI8pHMxLhACNpOe2BaBW1m4O1JgIP/.mIXUyRR6k.MO2M.');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `agency` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `number` varchar(50) DEFAULT NULL,
  `progress` varchar(100) DEFAULT NULL,
  `case_id` varchar(100) DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `agency`, `name`, `image`, `latitude`, `longitude`, `number`, `progress`, `case_id`, `details`, `created_at`) VALUES
(1, 'Police Department', 'alain barsime', NULL, -1.6015627, 29.5160920, '234098172384234', 'resolved', 'CASE_90F6F1EA2896D805', 'There is a school where students are abused', '2025-05-18 18:20:27'),
(2, 'Public Health Department', 'Ornella fax', '/uploads/complaint_1747595735_e689b3bf51550016.png', 0.0000000, 0.0000000, '123456782345678', 'in process', 'CASE_429267C748D4D0F1', 'The hospital at our district gives poor services', '2025-05-18 19:15:35'),
(3, 'Emergency Medical Services', 'ariane', NULL, -1.6285696, 29.5567360, '234567893456789', 'Not seen', 'CASE_426C6F26FAC83009', 'The injuries gone deep for a child with no insurance', '2025-05-18 19:18:39'),
(4, 'Municipal Corporation', 'ange', NULL, 0.0000000, 0.0000000, '2508768333', 'Not seen', 'CASE_EB78B57CF6E0A368', 'sport balls are few in district', '2025-05-18 19:20:57'),
(5, 'Public Health Department', 'christian', NULL, -1.6015822, 29.5160829, '123456789034', 'resolved', 'CASE_675E018188DAC378', 'health care is poor for kids in', '2025-05-18 19:21:39'),
(6, 'Education Department', 'Rwanda coding academy', '/uploads/complaint_1747596201_344c8eab9ea8ca41.jpg', 0.0000000, 0.0000000, '231433289435', 'resolved', 'CASE_9F510949E6B22D4F', 'Few budget in tech industry of Rwanda', '2025-05-18 19:23:21'),
(7, 'Public Health Department', 'John doe', NULL, -1.6285696, 29.5567360, '2893724932435445', 'resolved', 'CASE_961F8F4ACB625F1D', 'healthy diseases in kamonyi destrict', '2025-05-18 19:24:00'),
(8, 'Social Services Department', 'roger', NULL, -1.6285696, 29.5567360, '345983983', 'Not seen', 'CASE_DD502F96B969F855', 'There are issues in health care of old people in nyamasheke', '2025-05-18 20:35:32'),
(9, 'Public Health Department', 'james', NULL, -1.6285696, 29.5567360, '249093287', 'Not seen', 'CASE_9191A619D7E5FB21', 'healthy risks in using new nile products, please recheck', '2025-05-18 20:53:19'),
(10, 'Public Health Department', 'harris', NULL, -1.6285696, 29.5567360, '3456789', 'resolved', 'CASE_911098123F398141', 'corruption in health cares leading to deaths', '2025-05-18 20:59:49'),
(11, 'Police Department', 'alex monster', '/uploads/complaint_1747608100_ebe1e5df6c4253fe.png', -1.6285696, 29.5567360, '+250794023104', 'Not seen', 'CASE_C7D30293C4C4063A', 'i found a person hiding drugs here', '2025-05-18 22:41:40'),
(12, 'Public Health Department', 'steve jobs', NULL, -1.6285696, 29.5567360, '23456789089', 'resolved', 'CASE_95395F2D9EF7A823', 'i got headache which persisists, when my children approached they were affected to', '2025-05-18 22:44:08');

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` int(11) NOT NULL,
  `case_id` varchar(100) NOT NULL,
  `comment` text NOT NULL,
  `created_at` date DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discussions`
--

INSERT INTO `discussions` (`id`, `case_id`, `comment`, `created_at`) VALUES
(1, 'CASE_675E018188DAC378', 'How did it go on then??', '2025-05-18'),
(2, 'CASE_DD502F96B969F855', 'did you do anything?', '2025-05-18'),
(3, 'CASE_961F8F4ACB625F1D', 'yeahh', '2025-05-18'),
(4, 'CASE_911098123F398141', 'Hhhhh right??', '2025-05-18'),
(5, 'CASE_675E018188DAC378', 'yllh', '2025-05-18'),
(6, 'CASE_911098123F398141', 'do you know examples?', '2025-05-19'),
(7, 'CASE_911098123F398141', 'sdfghj', '2025-05-19'),
(8, 'CASE_961F8F4ACB625F1D', 'hey what about you', '2025-05-19'),
(9, 'CASE_90F6F1EA2896D805', 'How is the issue??', '2025-05-19'),
(10, 'CASE_911098123F398141', 'sdfghjkldfghjkl', '2025-05-19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agency`
--
ALTER TABLE `agency`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agency`
--
ALTER TABLE `agency`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `discussions`
--
ALTER TABLE `discussions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
