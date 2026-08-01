import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class VercelBundleTests(unittest.TestCase):
    def test_app_imports_when_public_is_served_outside_python_bundle(self):
        with tempfile.TemporaryDirectory() as directory:
            bundle = Path(directory)
            shutil.copy2(PROJECT_ROOT / "app.py", bundle / "app.py")
            shutil.copytree(PROJECT_ROOT / "src", bundle / "src")

            process = subprocess.run(
                [sys.executable, "-c", "import app"],
                cwd=bundle,
                capture_output=True,
                text=True,
                check=False,
            )

        self.assertEqual(process.returncode, 0, process.stderr)


if __name__ == "__main__":
    unittest.main()
