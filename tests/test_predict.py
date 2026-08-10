import math
import unittest

from src.models.predict import UnknownTeamError, get_available_teams, predict_match


class PredictMatchTests(unittest.TestCase):
    def test_reference_fixture_keeps_existing_probabilities(self):
        result = predict_match("Paris SG", "Marseille")

        self.assertEqual(result["prediction"], {"class": "H", "label": "Paris SG"})
        self.assertAlmostEqual(result["probabilities"]["home"], 0.7298, places=4)
        self.assertAlmostEqual(result["probabilities"]["draw"], 0.1673, places=4)
        self.assertAlmostEqual(result["probabilities"]["away"], 0.1029, places=4)
        self.assertTrue(math.isclose(sum(result["probabilities"].values()), 1.0))

    def test_prediction_includes_each_teams_five_most_recent_results(self):
        result = predict_match("Paris SG", "Marseille")

        self.assertEqual(
            result["recent_form"]["home"],
            [
                {
                    "date": "2026-05-17",
                    "opponent": "Paris FC",
                    "venue": "away",
                    "goals_for": 1,
                    "goals_against": 2,
                    "result": "L",
                },
                {
                    "date": "2026-05-13",
                    "opponent": "Lens",
                    "venue": "away",
                    "goals_for": 2,
                    "goals_against": 0,
                    "result": "W",
                },
                {
                    "date": "2026-05-10",
                    "opponent": "Brest",
                    "venue": "home",
                    "goals_for": 1,
                    "goals_against": 0,
                    "result": "W",
                },
                {
                    "date": "2026-05-02",
                    "opponent": "Lorient",
                    "venue": "home",
                    "goals_for": 2,
                    "goals_against": 2,
                    "result": "D",
                },
                {
                    "date": "2026-04-25",
                    "opponent": "Angers",
                    "venue": "away",
                    "goals_for": 3,
                    "goals_against": 0,
                    "result": "W",
                },
            ],
        )
        self.assertEqual(len(result["recent_form"]["away"]), 5)

    def test_current_teams_are_exposed(self):
        teams = get_available_teams()

        self.assertEqual(len(teams), 18)
        self.assertIn("Paris SG", teams)
        self.assertIn("Marseille", teams)

    def test_same_team_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "different"):
            predict_match("Lyon", "Lyon")

    def test_unknown_team_is_rejected(self):
        with self.assertRaises(UnknownTeamError):
            predict_match("Équipe imaginaire", "Lyon")


if __name__ == "__main__":
    unittest.main()
